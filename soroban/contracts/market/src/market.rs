/**
 * @notice DISCLAIMER - PLEASE READ CAREFULLY
 * ==========================================
 * This smart contract is provided "as is" and "as available", at your own risk, without warranty of any kind.
 *
 * By deploying, interacting with, or using this smart contract in any way, you acknowledge and agree that:
 * - This code may contain bugs, errors, or security vulnerabilities unknown to the developers
 * - The code may function unexpectedly or become deprecated
 * - You assume all risks associated with using this code including, but not limited to:
 *    - Complete loss of funds or tokens
 *    - Smart contract exploits or vulnerabilities
 *    - Unexpected behavior due to code errors
 *    - Economic or financial losses
 * - Neither the developers nor any associated parties:
 *    - Make any warranties about the code's reliability, accuracy, or fitness for any purpose
 *    - Are responsible for any losses or damages arising from its use
 *    - Guarantee the continuous functionality or maintenance of the code
 *
 * CONDUCT YOUR OWN DUE DILIGENCE AND SEEK PROFESSIONAL ADVICE BEFORE USING THIS CODE.
 * USE AT YOUR OWN RISK.
 */
// Unix time converter, example: https://www.unixtimestamp.com/
// Market lifecycle: Live -> Liquidate or Mature -> Liquidated or Matured
use soroban_sdk::{
    contract, contractimpl, contractmeta, symbol_short, token, Address, Env, String, Symbol,
};

use vault::vault::VaultContractClient;

use crate::{
    data::{MarketData, MarketDetails},
    errors::MarketError,
    keys::{MarketRisk, MarketStatus},
    storage::{
        extend_contract_ttl, extend_persistence_all_ttl, has_actual_event_timestamp,
        has_administrator, has_last_keeper_time, has_last_oracle_time, has_liquidated_time,
        has_matured_time, is_paused, read_actual_event_timestamp, read_administrator, read_asset,
        read_commission_fee, read_description, read_event_threshold_seconds, read_event_timestamp,
        read_hedge_vault, read_initialized_time, read_is_automatic, read_last_keeper_time,
        read_last_oracle_time, read_liquidated_time, read_lock_seconds, read_matured_time,
        read_name, read_oracle_address, read_oracle_name, read_risk_score, read_risk_vault,
        read_status, read_unlock_seconds, remove_is_paused, write_actual_event_timestamp,
        write_administrator, write_asset, write_commission_fee, write_description,
        write_event_threshold_seconds, write_event_timestamp, write_hedge_vault,
        write_initialized_time, write_is_automatic, write_is_paused, write_last_keeper_time,
        write_last_oracle_time, write_liquidated_time, write_lock_seconds, write_matured_time,
        write_name, write_oracle_address, write_oracle_name, write_risk_score, write_risk_vault,
        write_status, write_unlock_seconds, BUMP_THRESHOLD, EXTEND_TO_DAYS,
    },
};

contractmeta!(
    key = "Market Maker",
    val = "Implementation of the Market Maker using vaults in Soroban"
);

#[contract]
pub struct MarketContract;

const MIN_COMMISSION_FEE: u32 = 0;
const MAX_COMMISSION_FEE: u32 = 100;
const MIN_LOCK_IN_SECONDS: u64 = 0;
const MAX_LOCK_IN_SECONDS: u64 = 604800; // 7 days
const MIN_EVENT_THRESHOLD_IN_SECONDS: u64 = 0;
const MAX_EVENT_THRESHOLD_IN_SECONDS: u64 = 86400; // 1 day
const MIN_UNLOCK_IN_SECONDS: u64 = 0;
const MAX_UNLOCK_IN_SECONDS: u64 = 604800; // 7 days

#[allow(dead_code)]
#[contractimpl]
impl MarketContract {
    // Public functions

    pub fn init(env: Env, data: MarketData) -> Result<bool, MarketError> {
        // Authorize
        data.admin_address.require_auth();

        // Validate
        if has_administrator(&env) {
            return Err(MarketError::AlreadyInitialized);
        }

        let current_timestamp: u64 = env.ledger().timestamp();

        if data.event_unix_timestamp < current_timestamp {
            return Err(MarketError::InvalidUnixTimestamp);
        }

        if data.lock_period_in_seconds < MIN_LOCK_IN_SECONDS
            || data.lock_period_in_seconds > MAX_LOCK_IN_SECONDS
        {
            return Err(MarketError::InvalidLockPeriod);
        }

        if data.event_threshold_in_seconds < MIN_EVENT_THRESHOLD_IN_SECONDS
            || data.event_threshold_in_seconds > MAX_EVENT_THRESHOLD_IN_SECONDS
        {
            return Err(MarketError::InvalidEventThreshold);
        }

        if data.unlock_period_in_seconds < MIN_UNLOCK_IN_SECONDS
            || data.unlock_period_in_seconds > MAX_UNLOCK_IN_SECONDS
        {
            return Err(MarketError::InvalidUnlockPeriod);
        }

        if data.hedge_vault_address == data.risk_vault_address {
            return Err(MarketError::HedgeAndRiskAddressesAreSame);
        }

        if data.commission_fee < MIN_COMMISSION_FEE || data.commission_fee > MAX_COMMISSION_FEE {
            return Err(MarketError::InvalidCommisionFee);
        }

        let lock_timestamp: u64 = data
            .event_unix_timestamp
            .checked_sub(data.lock_period_in_seconds)
            .unwrap();
        let unlock_timestamp: u64 = data
            .event_unix_timestamp
            .checked_add(data.event_threshold_in_seconds)
            .unwrap()
            .checked_add(data.unlock_period_in_seconds)
            .unwrap();

        // Create Vaults
        let hedge_vault = VaultContractClient::new(&env, &data.hedge_vault_address);
        let risk_vault = VaultContractClient::new(&env, &data.risk_vault_address);

        _ = hedge_vault
            .try_initialize(
                &data.admin_address,
                &data.asset_address,
                &lock_timestamp,
                &unlock_timestamp,
            )
            .map_err(|_| MarketError::HedgeVaultInitializationFailed)?;

        _ = risk_vault
            .try_initialize(
                &data.admin_address,
                &data.asset_address,
                &lock_timestamp,
                &unlock_timestamp,
            )
            .map_err(|_| MarketError::RiskVaultInitializationFailed)?;

        // Approve asset allowance between hedge and risk vaults
        // The maximum TTL (Time To Live) for token allowance approval is capped at some ledgers.
        // For now hard-coded 17280, which is equivalent to approximately 1 day.
        // live_until must be >= ledger sequence
        _ = hedge_vault
            .try_approve_asset_allowance(
                &data.asset_address,
                &data.risk_vault_address,
                &i128::MAX,
                &(env.ledger().sequence() + 17280),
            )
            .map_err(|_| MarketError::HedgeVaultAllowanceFailed)?;

        _ = risk_vault
            .try_approve_asset_allowance(
                &data.asset_address,
                &data.hedge_vault_address,
                &i128::MAX,
                &(env.ledger().sequence() + 17280),
            )
            .map_err(|_| MarketError::RiskVaultAllowanceFailed)?;

        // Persist State
        write_administrator(&env, &data.admin_address);
        write_asset(&env, &data.asset_address);
        write_hedge_vault(&env, &data.hedge_vault_address);
        write_risk_vault(&env, &data.risk_vault_address);
        write_oracle_address(&env, &data.trusted_oracle_address);
        write_oracle_name(&env, &data.trusted_oracle_name);
        write_status(&env, &MarketStatus::LIVE);
        write_name(&env, &data.name);
        write_description(&env, &data.description);
        write_initialized_time(&env, &current_timestamp);
        write_commission_fee(&env, &data.commission_fee);
        write_risk_score(&env, &data.risk_score);
        write_is_automatic(&env, &data.is_automatic);
        write_event_timestamp(&env, &data.event_unix_timestamp);
        write_lock_seconds(&env, &data.lock_period_in_seconds);
        write_event_threshold_seconds(&env, &data.event_threshold_in_seconds);
        write_unlock_seconds(&env, &data.unlock_period_in_seconds);

        // Extend TTL
        extend_contract_ttl(&env, BUMP_THRESHOLD, EXTEND_TO_DAYS);
        extend_persistence_all_ttl(&env, BUMP_THRESHOLD, EXTEND_TO_DAYS);

        // Emit Event
        Self::_emit_init_event(&env, &data.admin_address, data.name, current_timestamp);

        // Return Result
        Ok(true)
    }

    pub fn status(env: Env) -> Result<MarketStatus, MarketError> {
        Self::check_is_initialized(&env)?;
        Ok(read_status(&env))
    }

    pub fn name(env: Env) -> Result<String, MarketError> {
        Self::check_is_initialized(&env)?;
        Ok(read_name(&env))
    }

    pub fn description(env: Env) -> Result<String, MarketError> {
        Self::check_is_initialized(&env)?;
        Ok(read_description(&env))
    }

    pub fn admin_address(env: Env) -> Result<Address, MarketError> {
        Self::check_is_initialized(&env)?;
        Ok(read_administrator(&env))
    }

    pub fn current_contract_address(env: Env) -> Address {
        env.current_contract_address()
    }

    pub fn current_ledger(env: Env) -> u64 {
        env.ledger().timestamp()
    }

    pub fn underlying_asset_address(env: Env) -> Result<Address, MarketError> {
        Self::check_is_initialized(&env)?;
        Ok(read_asset(&env))
    }

    pub fn hedge_address(env: Env) -> Result<Address, MarketError> {
        Self::check_is_initialized(&env)?;
        Ok(read_hedge_vault(&env))
    }

    pub fn risk_address(env: Env) -> Result<Address, MarketError> {
        Self::check_is_initialized(&env)?;
        Ok(read_risk_vault(&env))
    }

    pub fn oracle_address(env: Env) -> Result<Address, MarketError> {
        Self::check_is_initialized(&env)?;
        Ok(read_oracle_address(&env))
    }

    pub fn oracle_name(env: Env) -> Result<String, MarketError> {
        Self::check_is_initialized(&env)?;
        Ok(read_oracle_name(&env))
    }

    pub fn change_oracle(
        env: Env,
        oracle_address: Address,
        oracle_name: String,
    ) -> Result<bool, MarketError> {
        Self::check_is_initialized(&env)?;
        Self::ensure_not_paused(&env)?;
        let admin: Address = read_administrator(&env);
        admin.require_auth();
        write_oracle_address(&env, &oracle_address);
        write_oracle_name(&env, &oracle_name);
        Ok(true)
    }

    pub fn initialized_time(env: Env) -> Result<u64, MarketError> {
        Self::check_is_initialized(&env)?;
        Ok(read_initialized_time(&env))
    }

    pub fn expected_time_of_event(env: Env) -> Result<u64, MarketError> {
        Self::check_is_initialized(&env)?;
        Ok(read_event_timestamp(&env))
    }

    pub fn actual_time_of_event(env: Env) -> Result<u64, MarketError> {
        Self::check_is_initialized(&env)?;
        if !has_actual_event_timestamp(&env) {
            return Err(MarketError::ActualEventTimeNotSet);
        }
        Ok(read_actual_event_timestamp(&env))
    }

    pub fn time_until_event(env: Env) -> Result<u64, MarketError> {
        Self::check_is_initialized(&env)?;
        let current_timestamp: u64 = env.ledger().timestamp();
        let event_timestamp: u64 = read_event_timestamp(&env);
        if event_timestamp <= current_timestamp {
            return Ok(0);
        }
        Ok(event_timestamp - current_timestamp)
    }

    pub fn lock_period_in_seconds(env: Env) -> Result<u64, MarketError> {
        Self::check_is_initialized(&env)?;
        Ok(read_lock_seconds(&env))
    }

    pub fn time_until_lock(env: Env) -> Result<u64, MarketError> {
        Self::check_is_initialized(&env)?;
        let current_timestamp: u64 = env.ledger().timestamp();
        let event_timestamp: u64 = read_event_timestamp(&env);
        let lock_seconds: u64 = read_lock_seconds(&env);
        if current_timestamp >= event_timestamp.checked_sub(lock_seconds).unwrap() {
            return Ok(0);
        }
        Ok(event_timestamp
            .checked_sub(lock_seconds)
            .unwrap()
            .checked_sub(current_timestamp)
            .unwrap())
    }

    pub fn event_threshold_in_seconds(env: Env) -> Result<u64, MarketError> {
        Self::check_is_initialized(&env)?;
        Ok(read_event_threshold_seconds(&env))
    }

    pub fn unlock_period_in_seconds(env: Env) -> Result<u64, MarketError> {
        Self::check_is_initialized(&env)?;
        Ok(read_unlock_seconds(&env))
    }

    pub fn time_of_lock(env: Env) -> Result<u64, MarketError> {
        Self::check_is_initialized(&env)?;
        let lock: u64 = read_lock_seconds(&env);
        let event: u64 = read_event_timestamp(&env);
        let lock_timestamp: u64 = event.checked_sub(lock).unwrap();
        Ok(lock_timestamp)
    }

    pub fn time_of_unlock(env: Env) -> Result<u64, MarketError> {
        Self::check_is_initialized(&env)?;
        let unlock: u64 = read_unlock_seconds(&env);
        let event: u64 = read_event_timestamp(&env);
        let threshold: u64 = read_event_threshold_seconds(&env);
        let unlock_timestamp: u64 = event
            .checked_add(threshold)
            .unwrap()
            .checked_add(unlock)
            .unwrap();
        Ok(unlock_timestamp)
    }

    pub fn time_until_unlock(env: Env) -> Result<u64, MarketError> {
        Self::check_is_initialized(&env)?;
        let current_timestamp: u64 = env.ledger().timestamp();
        let unlock_time: u64 = Self::time_of_unlock(env)?;
        if current_timestamp >= unlock_time {
            return Ok(0);
        }
        Ok(unlock_time.checked_sub(current_timestamp).unwrap())
    }

    pub fn risk_score(env: Env) -> Result<MarketRisk, MarketError> {
        Self::check_is_initialized(&env)?;
        Ok(read_risk_score(&env))
    }

    pub fn change_risk_score(env: Env, risk: MarketRisk) -> Result<bool, MarketError> {
        Self::check_is_initialized(&env)?;
        Self::ensure_not_paused(&env)?;
        let admin: Address = read_administrator(&env);
        admin.require_auth();
        write_risk_score(&env, &risk);
        Ok(true)
    }

    pub fn exercising(env: Env) -> Result<Symbol, MarketError> {
        Self::check_is_initialized(&env)?;
        match read_is_automatic(&env) {
            true => Ok(symbol_short!("Automatic")),
            false => Ok(symbol_short!("Manual")),
        }
    }

    pub fn commission(env: Env) -> Result<u32, MarketError> {
        Self::check_is_initialized(&env)?;
        Ok(read_commission_fee(&env))
    }

    pub fn liquidated_time(env: Env) -> Result<u64, MarketError> {
        Self::check_is_initialized(&env)?;
        if !has_liquidated_time(&env) {
            return Err(MarketError::LiquidatedTimeNotSet);
        }
        Ok(read_liquidated_time(&env))
    }

    pub fn matured_time(env: Env) -> Result<u64, MarketError> {
        Self::check_is_initialized(&env)?;
        if !has_matured_time(&env) {
            return Err(MarketError::MaturityTimeNotSet);
        }
        Ok(read_matured_time(&env))
    }

    pub fn last_oracle_time(env: Env) -> Result<u64, MarketError> {
        Self::check_is_initialized(&env)?;
        if !has_last_oracle_time(&env) {
            return Err(MarketError::LastOracleTimeNotSet);
        }
        Ok(read_last_oracle_time(&env))
    }

    pub fn last_keeper_time(env: Env) -> Result<u64, MarketError> {
        Self::check_is_initialized(&env)?;
        if !has_last_keeper_time(&env) {
            return Err(MarketError::LastKeeperTimeNotSet);
        }
        Ok(read_last_keeper_time(&env))
    }

    /*
    NOTE: This function is NOT needed as vaults can lock themselves, when admin feeds them with time stamps.
    pub fn lock(env: Env) -> Result<bool, MarketError> {
        // Keeper bots should call this function to lock the vaults if possible
        // Locks vaults to prevent new deposits and withdrawals
        // Can be locked if status is live and current_time >= event_time - lock_seconds
        // Prevent from locking when already matured or liquidated or locked
        if !has_administrator(&env) {
            return Err(MarketError::NotInitialized);
        }
        let current_timestamp: u64 = env.ledger().timestamp();
        write_last_keeper_time(&env, &current_timestamp);
        Self::_ensure_not_paused(&env)?;
        let event_time: u64 = read_event_timestamp(&env);
        let lock_seconds: u64 = read_lock_seconds(&env);
        if current_timestamp < event_time - lock_seconds {
            return Err(MarketError::LockTooEarly);
        }
        Self::_ensure_not_liquidated_or_matured_or_locked(&env)?;
        write_status(&env, &MarketStatus::LOCKED);
        // Only admin can pause vaults?
        _ = Self::lock_vaults(&env)?;
        return Ok(true);
    }
    */

    pub fn bump(
        env: Env,
        event_occurred: bool,
        event_time: Option<u64>,
    ) -> Result<bool, MarketError> {
        // Trusted oracle should call this function to send bumps (status updates)
        // Set event_occurred to true if the market event has already happened.
        // Set event_time to when the event has happened. Optional if event_occurred is false.
        // If event occurred and event time > (expected event time + some threshold), then change status to liquidated.
        // If event occurred and event time <= (expected event time + some threshold), then change status to matured.
        // If event didn't occurr and event time >= (expected event time + some threshold), then change status to matured.
        // If event didn't occurr and event time < (expected event time + some threshold), then ignore.
        // If event occurred and no event time sent, then return an error.
        // If event didn't occurr and no event time sent, then ignore.
        // Note that oracles can only set the status to 'can liquidate' or 'can mature'. The actual liquidation or maturity action is done by keepers.
        Self::check_is_initialized(&env)?;
        // For now not required
        // let oracle: Address = read_oracle_address(&env);
        // oracle.require_auth();
        let current_timestamp: u64 = env.ledger().timestamp();
        write_last_oracle_time(&env, &current_timestamp);
        Self::ensure_not_paused(&env)?;
        // Check if already matured or liquidated
        Self::ensure_not_liquidated_or_matured(&env)?;
        // Check if liquidation or maturity should happen
        let expected_event_time: u64 = read_event_timestamp(&env);
        let event_threshold: u64 = read_event_threshold_seconds(&env);
        if event_occurred {
            match event_time {
                // Invalid bump data
                None => return Err(MarketError::EventTimeIsRequired),
                Some(e) => {
                    // Can be liquidated
                    if e > expected_event_time.checked_add(event_threshold).unwrap() {
                        write_liquidated_time(&env, &current_timestamp);
                        write_actual_event_timestamp(&env, &e);
                        write_status(&env, &MarketStatus::LIQUIDATE);
                        Self::emit_can_liquidate_event(
                            &env,
                            &read_hedge_vault(&env),
                            &read_risk_vault(&env),
                            read_name(&env),
                            current_timestamp,
                        );
                        return Ok(true);
                    } else {
                        // Can be matured
                        write_matured_time(&env, &current_timestamp);
                        write_actual_event_timestamp(&env, &e);
                        write_status(&env, &MarketStatus::MATURE);
                        Self::emit_can_mature_event(
                            &env,
                            &read_hedge_vault(&env),
                            &read_risk_vault(&env),
                            read_name(&env),
                            current_timestamp,
                        );
                        return Ok(true);
                    }
                }
            }
        } else {
            match event_time {
                // Such bump can be ignored
                None => return Ok(true),
                Some(e) => {
                    // Can be matured
                    if e >= expected_event_time.checked_add(event_threshold).unwrap() {
                        write_matured_time(&env, &current_timestamp);
                        write_actual_event_timestamp(&env, &e);
                        write_status(&env, &MarketStatus::MATURE);
                        Self::emit_can_mature_event(
                            &env,
                            &read_hedge_vault(&env),
                            &read_risk_vault(&env),
                            read_name(&env),
                            current_timestamp,
                        );
                        return Ok(true);
                    } else {
                        // Can be ignored
                        return Ok(true);
                    }
                }
            }
        }
    }

    pub fn mature(env: Env) -> Result<bool, MarketError> {
        // Anyone can and is even encouraged to call this function.
        Self::check_is_initialized(&env)?;
        let current_timestamp: u64 = env.ledger().timestamp();
        write_last_keeper_time(&env, &current_timestamp);
        Self::ensure_not_paused(&env)?;
        // Check if can be matured or liquidated. This also checks if it already matured or liquidated
        if read_status(&env) != MarketStatus::MATURE {
            return Err(MarketError::NotMature);
        }
        // Set status to inform others that the market has matured
        write_status(&env, &MarketStatus::MATURED);
        // Transfer assets between vaults and charge the commission fee.
        // If liquidation occurs: Risk collateral is transferred to the Hedge Vault.
        // If maturity is triggered: Hedge collateral is transferred to the Risk Vault.
        let hedge: Address = read_hedge_vault(&env);
        let risk: Address = read_risk_vault(&env);
        let asset_address: Address = read_asset(&env);
        Self::transfer_asset(&env, &asset_address, &hedge, &risk)?;
        // Emit event
        let name: String = read_name(&env);
        Self::emit_matured_event(&env, &hedge, &risk, name, current_timestamp);
        Ok(true)
    }

    pub fn liquidate(env: Env) -> Result<bool, MarketError> {
        // Anyone can and is even encouraged to call this function.
        Self::check_is_initialized(&env)?;
        let current_timestamp: u64 = env.ledger().timestamp();
        write_last_keeper_time(&env, &current_timestamp);
        Self::ensure_not_paused(&env)?;
        // Check if can be matured or liquidated. This also checks if it already matured or liquidated
        if read_status(&env) != MarketStatus::LIQUIDATE {
            return Err(MarketError::NotLiquidate);
        }
        // Set status to inform others that the market has matured
        write_status(&env, &MarketStatus::LIQUIDATED);
        // Transfer assets between vaults and charge the commission fee.
        // If liquidation occurs: Risk collateral is transferred to the Hedge Vault.
        // If maturity is triggered: Hedge collateral is transferred to the Risk Vault.
        let hedge: Address = read_hedge_vault(&env);
        let risk: Address = read_risk_vault(&env);
        let asset_address: Address = read_asset(&env);
        Self::transfer_asset(&env, &asset_address, &risk, &hedge)?;
        // Emit event
        let name: String = read_name(&env);
        Self::emit_liquidated_event(&env, &hedge, &risk, name, current_timestamp);
        Ok(true)
    }

    pub fn dispute(_env: Env) -> Result<bool, MarketError> {
        // Future work. Decide, who how and when can open disputes, and how to resolve them.
        Err(MarketError::NotImplementedYet)
    }

    pub fn calculate_vault_assets_ratio(env: Env) -> Result<i128, MarketError> {
        Self::check_is_initialized(&env)?;
        let hedge_vault = VaultContractClient::new(&env, &read_hedge_vault(&env));
        let risk_vault = VaultContractClient::new(&env, &read_risk_vault(&env));
        let assets_hedge: i128 = hedge_vault.total_assets();
        let assets_risk: i128 = risk_vault.total_assets();
        if assets_hedge == 0 || assets_risk == 0 {
            return Ok(0);
        }
        let ratio: i128 = assets_hedge.checked_div(assets_risk).unwrap();
        Ok(ratio)
    }

    pub fn calculate_vault_shares_ratio(env: Env) -> Result<i128, MarketError> {
        Self::check_is_initialized(&env)?;
        let hedge_vault = VaultContractClient::new(&env, &read_hedge_vault(&env));
        let risk_vault = VaultContractClient::new(&env, &read_risk_vault(&env));
        let shares_hedge: i128 = hedge_vault.total_shares();
        let shares_risk: i128 = risk_vault.total_shares();
        if shares_hedge == 0 || shares_risk == 0 {
            return Ok(0);
        }
        let ratio: i128 = shares_hedge.checked_div(shares_risk).unwrap();
        Ok(ratio)
    }

    pub fn calculate_hedge_potential_return(
        env: Env,
        caller: Address,
    ) -> Result<i128, MarketError> {
        Self::check_is_initialized(&env)?;
        caller.require_auth();
        let hedge: Address = read_hedge_vault(&env);
        let risk: Address = read_risk_vault(&env);
        let vault = VaultContractClient::new(&env, &hedge);
        let token_client = token::Client::new(&env, &read_asset(&env));
        let assets_hedge: i128 = token_client.balance(&hedge);
        let assets_risk: i128 = token_client.balance(&risk);
        let fee_percentage: u32 = read_commission_fee(&env);
        let admin_fee_hedge: i128 = Self::calculate_fee_amount(assets_hedge, fee_percentage);
        let admin_fee_risk: i128 = Self::calculate_fee_amount(assets_risk, fee_percentage);
        // (total assets for distribution) = (hedge assets) + (risk assets) - (admin fee assets)
        let total_assets: i128 = assets_hedge
            .checked_add(assets_risk)
            .unwrap()
            .checked_sub(admin_fee_hedge)
            .unwrap()
            .checked_sub(admin_fee_risk)
            .unwrap();
        let total_shares: i128 = vault.total_shares();
        let caller_shares: i128 = vault.balance_of_shares(&caller);
        let potential_return_value: i128 =
            vault.convert_to_assets_simulate(&caller_shares, &total_shares, &total_assets);
        Ok(potential_return_value)
    }

    pub fn calculate_risk_potential_return(env: Env, caller: Address) -> Result<i128, MarketError> {
        Self::check_is_initialized(&env)?;
        caller.require_auth();
        let hedge: Address = read_hedge_vault(&env);
        let risk: Address = read_risk_vault(&env);
        let vault = VaultContractClient::new(&env, &risk);
        let token_client = token::Client::new(&env, &read_asset(&env));
        let assets_hedge: i128 = token_client.balance(&hedge);
        let assets_risk: i128 = token_client.balance(&risk);
        let fee_percentage: u32 = read_commission_fee(&env);
        let admin_fee_hedge: i128 = Self::calculate_fee_amount(assets_hedge, fee_percentage);
        let admin_fee_risk: i128 = Self::calculate_fee_amount(assets_risk, fee_percentage);
        // (total assets for distribution) = (hedge assets) + (risk assets) - (admin fee assets)
        let total_assets: i128 = assets_hedge
            .checked_add(assets_risk)
            .unwrap()
            .checked_sub(admin_fee_hedge)
            .unwrap()
            .checked_sub(admin_fee_risk)
            .unwrap();
        let total_shares: i128 = vault.total_shares();
        let caller_shares: i128 = vault.balance_of_shares(&caller);
        let potential_return_value: i128 =
            vault.convert_to_assets_simulate(&caller_shares, &total_shares, &total_assets);
        Ok(potential_return_value)
    }

    pub fn is_market_paused(env: Env) -> bool {
        is_paused(&env)
    }

    pub fn pause_market(env: Env) -> Result<bool, MarketError> {
        // Pause this contract and underlying vaults
        Self::check_is_initialized(&env)?;
        let admin: Address = read_administrator(&env);
        admin.require_auth();
        if is_paused(&env) {
            Err(MarketError::ContractIsAlreadyPaused)
        } else {
            _ = Self::lock_vaults(&env)?;
            write_is_paused(&env);
            Ok(true)
        }
    }

    pub fn unpause_market(env: Env) -> Result<bool, MarketError> {
        // Unpause this contract and underlying vaults
        Self::check_is_initialized(&env)?;
        let admin: Address = read_administrator(&env);
        admin.require_auth();
        if is_paused(&env) {
            remove_is_paused(&env);
            _ = Self::unlock_vaults(&env)?;
            return Ok(true);
        }
        Err(MarketError::ContractIsAlreadyUnpaused)
    }

    pub fn extend_market_ttl(env: &Env) -> Result<bool, MarketError> {
        // Anyone can call this function to extend time-to-live
        if has_administrator(&env) {
            extend_contract_ttl(&env, BUMP_THRESHOLD, EXTEND_TO_DAYS);
            extend_persistence_all_ttl(&env, BUMP_THRESHOLD, EXTEND_TO_DAYS);
            Ok(true)
        } else {
            Err(MarketError::NotInitialized)
        }
    }

    pub fn market_details(env: &Env, caller: Address) -> Result<MarketDetails, MarketError> {
        if has_administrator(&env) {
            let name = read_name(&env);
            let description = read_description(&env);
            let status = read_status(&env);
            let hedge_address = read_hedge_vault(&env);
            let risk_address = read_risk_vault(&env);
            let oracle_address = read_oracle_address(&env);
            let oracle_name = read_oracle_name(&env);
            let risk_score = read_risk_score(&env);
            let event_time = read_event_timestamp(&env);
            let is_automatic = read_is_automatic(&env);
            let commission_fee = read_commission_fee(&env);

            let hedge_vault = VaultContractClient::new(&env, &hedge_address);
            let risk_vault = VaultContractClient::new(&env, &risk_address);

            let hedge_admin_address = hedge_vault.administrator_address();
            let hedge_asset_address = hedge_vault.asset_address();
            let hedge_asset_symbol = hedge_vault.asset_symbol();
            let hedge_total_shares = hedge_vault.total_shares();
            let hedge_total_assets = hedge_vault.total_assets();
            let hedge_address_shares = hedge_vault.balance_of_shares(&caller);

            let risk_admin_address = risk_vault.administrator_address();
            let risk_asset_address = risk_vault.asset_address();
            let risk_asset_symbol = risk_vault.asset_symbol();
            let risk_total_shares = risk_vault.total_shares();
            let risk_total_assets = risk_vault.total_assets();
            let risk_address_shares = risk_vault.balance_of_shares(&caller);

            Ok(MarketDetails {
                name,
                description,
                status,
                hedge_address,
                risk_address,
                oracle_address,
                oracle_name,
                risk_score,
                event_time,
                is_automatic,
                commission_fee,
                hedge_admin_address,
                hedge_asset_address,
                hedge_asset_symbol,
                hedge_total_shares,
                hedge_total_assets,
                hedge_address_shares,
                risk_admin_address,
                risk_asset_address,
                risk_asset_symbol,
                risk_total_shares,
                risk_total_assets,
                risk_address_shares,
            })
        } else {
            Err(MarketError::NotInitialized)
        }
    }

    // Private functions

    fn check_is_initialized(env: &Env) -> Result<(), MarketError> {
        if !has_administrator(&env) {
            return Err(MarketError::NotInitialized);
        }
        Ok(())
    }

    fn ensure_not_paused(env: &Env) -> Result<(), MarketError> {
        match is_paused(env) {
            true => Err(MarketError::ContractIsAlreadyPaused),
            false => Ok(()),
        }
    }

    fn ensure_not_liquidated_or_matured(env: &Env) -> Result<(), MarketError> {
        let status: MarketStatus = read_status(&env);
        if status == MarketStatus::LIQUIDATED || status == MarketStatus::LIQUIDATE {
            return Err(MarketError::AlreadyLiquidated);
        }
        if status == MarketStatus::MATURED || status == MarketStatus::MATURE {
            return Err(MarketError::AlreadyMatured);
        }
        Ok(())
    }

    /*
    NOTE: This function is NOT needed with the new lock mechanism.
    fn _ensure_not_liquidated_or_matured_or_locked(env: &Env) -> Result<(), MarketError> {
    let status: MarketStatus = read_status(&env);
    if status == MarketStatus::LIQUIDATED || status == MarketStatus::LIQUIDATE {
        return Err(MarketError::AlreadyLiquidated);
    }
    if status == MarketStatus::MATURED || status == MarketStatus::MATURE {
        return Err(MarketError::AlreadyMatured);
    }
    if status == MarketStatus::LOCKED {
        return Err(MarketError::AlreadyLocked);
    }
    Ok(())
    }
    */

    fn calculate_fee_amount(whole_amount: i128, fee_percentage: u32) -> i128 {
        if fee_percentage <= 0 {
            return 0_i128;
        }
        // (fee amount) = (balance of assets) * (fee percentage) / 100.
        let fee_amount: i128 = (whole_amount.checked_mul(fee_percentage.into()).unwrap())
            .checked_div(100_i128)
            .unwrap();
        fee_amount
    }

    fn transfer_asset(
        env: &Env,
        asset_address: &Address,
        from_vault: &Address,
        to_vault: &Address,
    ) -> Result<(), MarketError> {
        // Note: before calling this function, make sure that vaults have enabled full transfer allowance of the underlying asset between each other
        let token_client = token::Client::new(&env, &asset_address);
        let allowance_1: i128 = token_client.allowance(&from_vault, &to_vault);
        let balance_1: i128 = token_client.balance(&from_vault);
        if balance_1 > allowance_1 {
            return Err(MarketError::InsufficientAllowance);
        }
        let fee_percentage: u32 = read_commission_fee(&env);
        if fee_percentage > 0 {
            let admin_fee_amount_1: i128 = Self::calculate_fee_amount(balance_1, fee_percentage);
            let balance_2: i128 = token_client.balance(&to_vault);
            let admin_fee_amount_2: i128 = Self::calculate_fee_amount(balance_2, fee_percentage);
            let allowance_2: i128 = token_client.allowance(&to_vault, &from_vault);
            if balance_2 > allowance_2 {
                return Err(MarketError::InsufficientAllowanceForFeeTransfer);
            }
            let admin: Address = read_administrator(&env);
            // Make sure transfers happen after all the calculations are done
            if balance_1 - admin_fee_amount_1 > 0 {
                // Transfer asset amount minus fee amount from one vault to another
                token_client.transfer(&from_vault, &to_vault, &(balance_1 - admin_fee_amount_1));
            }
            if admin_fee_amount_1 > 0 {
                // Transfer fee amount to market administrator (vault must already have the allowance)
                token_client.transfer_from(&to_vault, &from_vault, &admin, &admin_fee_amount_1);
            }
            if admin_fee_amount_2 > 0 {
                // Another vault also needs to transfer fee amount to market administrator (vault must already have the allowance)
                token_client.transfer_from(&from_vault, &to_vault, &admin, &admin_fee_amount_2);
            }
        } else {
            // Transfer whole asset amount from one vault to another. No admin fee was configured.
            token_client.transfer(&from_vault, &to_vault, &balance_1);
        }
        Ok(())
    }

    fn lock_vaults(env: &Env) -> Result<bool, MarketError> {
        // This will work if called only by admin. Used when market contract is pausing.
        let hedge: Address = read_hedge_vault(&env);
        let risk: Address = read_risk_vault(&env);
        let hedge_vault = VaultContractClient::new(&env, &hedge);
        let risk_vault = VaultContractClient::new(&env, &risk);
        _ = hedge_vault
            .try_pause()
            .map_err(|_| MarketError::VaultPauseFailed)?;
        _ = risk_vault
            .try_pause()
            .map_err(|_| MarketError::VaultPauseFailed)?;
        Ok(true)
    }

    fn unlock_vaults(env: &Env) -> Result<bool, MarketError> {
        // This will work if called only by admin. Used when market contract is unpausing.
        let hedge: Address = read_hedge_vault(&env);
        let risk: Address = read_risk_vault(&env);
        let hedge_vault = VaultContractClient::new(&env, &hedge);
        let risk_vault = VaultContractClient::new(&env, &risk);
        _ = hedge_vault
            .try_unpause()
            .map_err(|_| MarketError::VaultUnpauseFailed)?;
        _ = risk_vault
            .try_unpause()
            .map_err(|_| MarketError::VaultUnpauseFailed)?;
        Ok(true)
    }

    fn emit_matured_event(
        env: &Env,
        hedge: &Address,
        risk: &Address,
        name: String,
        timestamp: u64,
    ) {
        let topics = (symbol_short!("mature"), hedge, risk);
        env.events().publish(topics, (name, timestamp));
    }

    fn emit_liquidated_event(
        env: &Env,
        hedge: &Address,
        risk: &Address,
        name: String,
        timestamp: u64,
    ) {
        let topics = (symbol_short!("liquidate"), hedge, risk);
        env.events().publish(topics, (name, timestamp));
    }

    fn emit_can_mature_event(
        env: &Env,
        hedge: &Address,
        risk: &Address,
        name: String,
        timestamp: u64,
    ) {
        let topics = (symbol_short!("bumpmat"), hedge, risk);
        env.events().publish(topics, (name, timestamp));
    }

    fn emit_can_liquidate_event(
        env: &Env,
        hedge: &Address,
        risk: &Address,
        name: String,
        timestamp: u64,
    ) {
        let topics = (symbol_short!("bumpliq"), hedge, risk);
        env.events().publish(topics, (name, timestamp));
    }

    fn _emit_init_event(env: &Env, admin: &Address, name: String, timestamp: u64) {
        let topics = (symbol_short!("init"), admin);
        env.events().publish(topics, (name, timestamp));
    }
}
