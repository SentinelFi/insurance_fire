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
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/ERC4626.sol
use soroban_sdk::{
    contract, contractclient, contractimpl, contractmeta, symbol_short, token, Address, Env, String,
};

use crate::{
    allowance::{_approve_allowance, _calculate_expiry_ledger, _spend_allowance},
    errors::{ContractError, VaultError},
    ivault::IPublicVault,
    math::{
        mul_div, safe_add_i128, safe_add_u32, safe_div, safe_mul, safe_pow, safe_sub_i128, Rounding,
    },
    storage::{
        deposit_paused, extend_contract_ttl, extend_persistence_all_ttl, has_administrator,
        is_paused, read_administrator, read_asset_address, read_asset_decimals, read_asset_name,
        read_asset_symbol, read_lock_timestamp, read_total_shares, read_total_shares_of,
        read_unlock_timestamp, remove_deposit_paused, remove_paused, remove_withdraw_paused,
        withdraw_paused, write_administrator, write_asset_address, write_asset_decimals,
        write_asset_name, write_asset_symbol, write_deposit_paused, write_lock_timestamp,
        write_paused, write_total_shares, write_total_shares_of, write_unlock_timestamp,
        write_withdraw_paused, BUMP_THRESHOLD, EXTEND_TO_DAYS,
    },
};

contractmeta!(
    key = "ERC-4626",
    val = "Implementation of the ERC-4626 Tokenized Vault Standard in Soroban"
);

#[contract]
pub struct Vault;

// Public functions
#[contractclient(name = "VaultContractClient")]
#[contractimpl]
impl IPublicVault for Vault {
    fn initialize(
        env: Env,
        admin: Address,
        asset_address: Address,
        lock_timestamp: u64,
        unlock_timestamp: u64,
    ) -> Result<(String, String, u32), ContractError> {
        admin.require_auth();

        if has_administrator(&env) {
            Err(ContractError::AlreadyInitialized)
        } else {
            if lock_timestamp > unlock_timestamp {
                return Err(ContractError::InvalidLockTimes);
            }
            // Before passing asset_address, verify the underlying asset contract exists and implements the token trait, otherwise initialization will fail
            let token_client = token::Client::new(&env, &asset_address);
            let name: String = token_client.name();
            let symbol: String = token_client.symbol();
            let decimals: u32 = token_client.decimals();

            // Underlying asset, e.g. USDC or XLM
            write_asset_address(&env, &asset_address);
            write_asset_name(&env, &name);
            write_asset_symbol(&env, &symbol);
            write_asset_decimals(&env, &decimals);

            write_total_shares(&env, &0i128);
            write_administrator(&env, &admin);
            write_lock_timestamp(&env, &lock_timestamp);
            write_unlock_timestamp(&env, &unlock_timestamp);

            extend_contract_ttl(&env, BUMP_THRESHOLD, EXTEND_TO_DAYS);
            extend_persistence_all_ttl(&env, BUMP_THRESHOLD, EXTEND_TO_DAYS);

            Self::_emit_initialized_event(
                &env,
                &admin,
                &asset_address,
                name.clone(),
                symbol.clone(),
                decimals,
            );

            Ok((name, symbol, decimals))
        }
    }

    fn administrator_address(env: &Env) -> Result<Address, ContractError> {
        if has_administrator(&env) {
            Ok(read_administrator(&env))
        } else {
            Err(ContractError::NotInitialized)
        }
    }

    fn asset_decimals(env: &Env) -> Result<u32, ContractError> {
        if has_administrator(&env) {
            let decimals: u32 = read_asset_decimals(&env);
            let result: u32 = safe_add_u32(decimals, Self::_decimals_offset());
            Ok(result)
        } else {
            Err(ContractError::NotInitialized)
        }
    }

    fn asset_symbol(env: &Env) -> Result<String, ContractError> {
        if has_administrator(&env) {
            let symbol: String = read_asset_symbol(&env);
            Ok(symbol)
        } else {
            Err(ContractError::NotInitialized)
        }
    }

    fn asset_name(env: &Env) -> Result<String, ContractError> {
        if has_administrator(&env) {
            let name: String = read_asset_name(&env);
            Ok(name)
        } else {
            Err(ContractError::NotInitialized)
        }
    }

    fn asset_address(env: &Env) -> Result<Address, ContractError> {
        if has_administrator(&env) {
            let asset_address: Address = read_asset_address(&env);
            Ok(asset_address)
        } else {
            Err(ContractError::NotInitialized)
        }
    }

    fn contract_address(env: &Env) -> Address {
        env.current_contract_address()
    }

    fn total_assets(env: &Env) -> Result<i128, ContractError> {
        if has_administrator(&env) {
            let asset_address: Address = read_asset_address(&env);
            let token_client = token::Client::new(&env, &asset_address);
            let this_address: Address = Self::contract_address(&env);
            let balance: i128 = token_client.balance(&this_address);
            let return_balance: i128 = Self::_divide_by_decimals(env, balance);
            Ok(return_balance)
        } else {
            Err(ContractError::NotInitialized)
        }
    }

    fn total_shares(env: &Env) -> Result<i128, ContractError> {
        if has_administrator(&env) {
            let total_shares: i128 = read_total_shares(&env);
            Ok(total_shares)
        } else {
            Err(ContractError::NotInitialized)
        }
    }

    fn balance_of_shares(env: &Env, address: Address) -> Result<i128, ContractError> {
        if has_administrator(&env) {
            let balance: i128 = read_total_shares_of(&env, address.clone());
            Ok(balance)
        } else {
            Err(ContractError::NotInitialized)
        }
    }

    fn lock_timestamp(env: Env) -> Result<u64, ContractError> {
        if has_administrator(&env) {
            let lock: u64 = read_lock_timestamp(&env);
            Ok(lock)
        } else {
            Err(ContractError::NotInitialized)
        }
    }

    fn unlock_timestamp(env: Env) -> Result<u64, ContractError> {
        if has_administrator(&env) {
            let unlock: u64 = read_unlock_timestamp(&env);
            Ok(unlock)
        } else {
            Err(ContractError::NotInitialized)
        }
    }

    fn convert_to_shares(env: &Env, assets: i128) -> Result<i128, ContractError> {
        Self::_convert_to_shares(env, assets, Rounding::Floor)
    }

    fn convert_to_assets(env: &Env, shares: i128) -> Result<i128, ContractError> {
        Self::_convert_to_assets(env, shares, Rounding::Floor)
    }

    fn convert_to_shares_simulate(
        _env: &Env,
        assets: i128,
        total_assets: i128,
        total_shares: i128,
    ) -> Result<i128, ContractError> {
        Self::_convert_to_shares_simulate(assets, total_assets, total_shares, Rounding::Floor)
    }

    fn convert_to_assets_simulate(
        _env: &Env,
        shares: i128,
        total_shares: i128,
        total_assets: i128,
    ) -> Result<i128, ContractError> {
        Self::_convert_to_assets_simulate(shares, total_shares, total_assets, Rounding::Floor)
    }

    fn max_deposit(_: &Env, _address: Address) -> i128 {
        i128::MAX
    }

    fn max_mint(_: &Env, _address: Address) -> i128 {
        i128::MAX
    }

    fn max_withdraw(env: &Env, owner: Address) -> i128 {
        match Self::balance_of_shares(&env, owner) {
            Ok(value) => match Self::_convert_to_assets(&env, value, Rounding::Floor) {
                Ok(val) => val,
                Err(er) => panic!("Call failed with error: {:?}", er),
            },
            Err(e) => panic!("Call failed with error: {:?}", e),
        }
    }

    fn max_redeem(env: &Env, owner: Address) -> i128 {
        match Self::balance_of_shares(&env, owner) {
            Ok(value) => value,
            Err(e) => panic!("Call failed with error: {:?}", e),
        }
    }

    fn preview_deposit(env: &Env, assets: i128) -> Result<i128, ContractError> {
        if has_administrator(&env) {
            Self::_convert_to_shares(&env, assets, Rounding::Floor)
        } else {
            Err(ContractError::NotInitialized)
        }
    }

    fn preview_mint(env: &Env, shares: i128) -> Result<i128, ContractError> {
        if has_administrator(&env) {
            Self::_convert_to_assets(&env, shares, Rounding::Ceil)
        } else {
            Err(ContractError::NotInitialized)
        }
    }

    fn preview_withdraw(env: &Env, assets: i128) -> Result<i128, ContractError> {
        if has_administrator(&env) {
            Self::_convert_to_shares(&env, assets, Rounding::Ceil)
        } else {
            Err(ContractError::NotInitialized)
        }
    }

    fn preview_redeem(env: &Env, shares: i128) -> Result<i128, ContractError> {
        if has_administrator(&env) {
            Self::_convert_to_assets(&env, shares, Rounding::Floor)
        } else {
            Err(ContractError::NotInitialized)
        }
    }

    fn deposit(
        env: Env,
        assets: i128,
        caller: Address,
        receiver: Address,
    ) -> Result<i128, VaultError> {
        if has_administrator(&env) {
            caller.require_auth();
            if assets <= 0 {
                Err(VaultError::ZeroAssets)
            } else {
                let max_assets: i128 = Self::max_deposit(&env, receiver.clone());
                if assets > max_assets {
                    Err(VaultError::ERC4626ExceededMaxDeposit)
                } else {
                    let shares: i128 = Self::preview_deposit(&env, assets).unwrap();
                    Self::_deposit(&env, &caller, &receiver, assets, shares);
                    Ok(shares)
                }
            }
        } else {
            Err(VaultError::AdministratorError)
        }
    }

    fn mint(
        env: Env,
        shares: i128,
        caller: Address,
        receiver: Address,
    ) -> Result<i128, VaultError> {
        if has_administrator(&env) {
            caller.require_auth();
            if shares <= 0 {
                Err(VaultError::ZeroShares)
            } else {
                let max_shares: i128 = Self::max_mint(&env, receiver.clone());
                if shares > max_shares {
                    Err(VaultError::ERC4626ExceededMaxMint)
                } else {
                    let assets: i128 = Self::preview_mint(&env, shares).unwrap();
                    Self::_deposit(&env, &caller, &receiver, assets, shares);
                    Ok(assets)
                }
            }
        } else {
            Err(VaultError::AdministratorError)
        }
    }

    fn withdraw(
        env: Env,
        assets: i128,
        caller: Address,
        receiver: Address,
        owner: Address,
    ) -> Result<i128, VaultError> {
        if has_administrator(&env) {
            caller.require_auth();
            if assets <= 0 {
                Err(VaultError::ZeroAssets)
            } else {
                let max_assets: i128 = Self::max_withdraw(&env, owner.clone());
                if assets > max_assets {
                    Err(VaultError::ERC4626ExceededMaxWithdraw)
                } else {
                    let shares: i128 = Self::preview_withdraw(&env, assets).unwrap();
                    Self::_withdraw(&env, &caller, &receiver, &owner, assets, shares);
                    Ok(shares)
                }
            }
        } else {
            Err(VaultError::AdministratorError)
        }
    }

    fn redeem(
        env: Env,
        shares: i128,
        caller: Address,
        receiver: Address,
        owner: Address,
    ) -> Result<i128, VaultError> {
        if has_administrator(&env) {
            caller.require_auth();
            if shares <= 0 {
                Err(VaultError::ZeroShares)
            } else {
                let max_shares: i128 = Self::max_redeem(&env, owner.clone());
                if shares > max_shares {
                    Err(VaultError::ERC4626ExceededMaxRedeem)
                } else {
                    let assets: i128 = Self::preview_redeem(&env, shares).unwrap();
                    Self::_withdraw(&env, &caller, &receiver, &owner, assets, shares);
                    Ok(assets)
                }
            }
        } else {
            Err(VaultError::AdministratorError)
        }
    }

    fn approve_shares(
        env: Env,
        owner: Address,
        spender: Address,
        approve_amount: i128,
        expire_in_days: u32,
    ) -> Result<bool, VaultError> {
        if has_administrator(&env) {
            owner.require_auth();
            if approve_amount <= 0 {
                Err(VaultError::InvalidAmount)
            } else {
                if owner == spender {
                    Err(VaultError::CannotApproveOrTransferToSelf)
                } else {
                    let expiry_ledger: u32 = _calculate_expiry_ledger(&env, expire_in_days)?;
                    _approve_allowance(&env, &owner, &spender, approve_amount, expiry_ledger)?;
                    Ok(true)
                }
            }
        } else {
            Err(VaultError::AdministratorError)
        }
    }

    fn transfer_shares(
        env: Env,
        owner: Address,
        receiver: Address,
        shares_amount: i128,
    ) -> Result<bool, VaultError> {
        if has_administrator(&env) {
            owner.require_auth();
            if shares_amount <= 0 {
                Err(VaultError::InvalidAmount)
            } else {
                let owner_shares: i128 = read_total_shares_of(&env, owner.clone());
                if owner_shares < shares_amount {
                    Err(VaultError::InvalidAmount)
                } else {
                    if owner == receiver {
                        Err(VaultError::CannotApproveOrTransferToSelf)
                    } else {
                        // Change owner's and receiver's token balances
                        // Total shares should remain unchanged
                        let receiver_shares: i128 = read_total_shares_of(&env, receiver.clone());
                        write_total_shares_of(
                            &env,
                            owner.clone(),
                            &safe_sub_i128(owner_shares, shares_amount),
                        );
                        write_total_shares_of(
                            &env,
                            receiver.clone(),
                            &safe_add_i128(receiver_shares, shares_amount),
                        );
                        Self::_emit_transfer_shares_event(&env, &owner, &receiver, shares_amount);
                        Ok(true)
                    }
                }
            }
        } else {
            Err(VaultError::AdministratorError)
        }
    }

    fn approve_asset_allowance(
        env: Env,
        asset_address: Address,
        spender: Address,
        approve_amount: i128,
        expiration_ledger: u32,
    ) -> Result<(), VaultError> {
        // Contracts can approve token allowances without explicit require_auth() when they are acting on their own behalf.
        // The contract's address itself implies authorization.
        // However, admin or similar access control is still needed to prevent unauthorized approvals.
        if has_administrator(&env) {
            let admin: Address = read_administrator(&env);
            admin.require_auth();
            if approve_amount <= 0 {
                Err(VaultError::InvalidAmount)
            } else {
                let token_client = token::Client::new(&env, &asset_address);
                token_client.approve(
                    &env.current_contract_address(),
                    &spender,
                    &approve_amount,
                    &expiration_ledger,
                );
                Ok(())
            }
        } else {
            Err(VaultError::AdministratorError)
        }
    }

    fn is_paused(env: Env) -> bool {
        is_paused(&env)
    }

    fn pause(env: Env) -> Result<bool, ContractError> {
        if has_administrator(&env) {
            let admin: Address = read_administrator(&env);
            admin.require_auth();
            if is_paused(&env) {
                Err(ContractError::ContractIsAlreadyPaused)
            } else {
                write_paused(&env);
                Ok(true)
            }
        } else {
            Err(ContractError::NotInitialized)
        }
    }

    fn unpause(env: Env) -> Result<bool, ContractError> {
        if has_administrator(&env) {
            let admin: Address = read_administrator(&env);
            admin.require_auth();
            if is_paused(&env) {
                remove_paused(&env);
                remove_deposit_paused(&env);
                remove_withdraw_paused(&env);
                Ok(true)
            } else {
                Err(ContractError::ContractIsAlreadyNotPaused)
            }
        } else {
            Err(ContractError::NotInitialized)
        }
    }

    fn pause_deposit(env: Env) -> Result<bool, ContractError> {
        if has_administrator(&env) {
            let admin: Address = read_administrator(&env);
            admin.require_auth();
            if is_paused(&env) {
                Err(ContractError::ContractIsAlreadyPaused)
            } else if deposit_paused(&env) {
                Err(ContractError::DepositIsAlreadyPaused)
            } else {
                write_deposit_paused(&env);
                Ok(true)
            }
        } else {
            Err(ContractError::NotInitialized)
        }
    }

    fn pause_withdrawal(env: Env) -> Result<bool, ContractError> {
        if has_administrator(&env) {
            let admin: Address = read_administrator(&env);
            admin.require_auth();
            if is_paused(&env) {
                Err(ContractError::ContractIsAlreadyPaused)
            } else if withdraw_paused(&env) {
                Err(ContractError::WithdrawIsAlreadyPaused)
            } else {
                write_withdraw_paused(&env);
                Ok(true)
            }
        } else {
            Err(ContractError::NotInitialized)
        }
    }

    fn unpause_deposit(env: Env) -> Result<bool, ContractError> {
        if has_administrator(&env) {
            let admin: Address = read_administrator(&env);
            admin.require_auth();
            if is_paused(&env) && deposit_paused(&env) {
                write_withdraw_paused(&env);
                remove_deposit_paused(&env);
                remove_paused(&env);
                Ok(true)
            } else {
                Err(ContractError::DepositIsAlreadyNotPaused)
            }
        } else {
            Err(ContractError::NotInitialized)
        }
    }

    fn unpause_withdrawal(env: Env) -> Result<bool, ContractError> {
        if has_administrator(&env) {
            let admin: Address = read_administrator(&env);
            admin.require_auth();
            if is_paused(&env) && withdraw_paused(&env) {
                write_deposit_paused(&env);
                remove_withdraw_paused(&env);
                remove_paused(&env);
                Ok(true)
            } else {
                Err(ContractError::DepositIsAlreadyNotPaused)
            }
        } else {
            Err(ContractError::NotInitialized)
        }
    }

    fn extend_vault_ttl(env: &Env) -> Result<bool, ContractError> {
        // Anyone can call this function to extend time-to-live
        if has_administrator(&env) {
            extend_contract_ttl(&env, BUMP_THRESHOLD, EXTEND_TO_DAYS);
            extend_persistence_all_ttl(&env, BUMP_THRESHOLD, EXTEND_TO_DAYS);
            Ok(true)
        } else {
            Err(ContractError::NotInitialized)
        }
    }
}

// Private functions
#[allow(dead_code)]
impl Vault {
    fn _transfer(
        env: Env,
        from: Address,
        to: Address,
        amount: i128,
    ) -> Result<(Address, Address, i128, i128), VaultError> {
        from.require_auth();
        if amount <= 0 {
            Err(VaultError::InvalidAmount)
        } else {
            let result: i128 = Self::_multiply_by_decimals(&env, amount);
            let asset_address: Address = read_asset_address(&env);
            let token_client = token::Client::new(&env, &asset_address);
            token_client.transfer(&from, &to, &result);

            Ok((from, to, amount, result))
        }
    }

    fn _multiply_by_decimals(env: &Env, amount: i128) -> i128 {
        let decimals: u32 = read_asset_decimals(&env);
        let result_pow: i128 = safe_pow(10_i128, decimals);
        let result: i128 = safe_mul(amount, result_pow);
        result
    }

    fn _divide_by_decimals(env: &Env, amount: i128) -> i128 {
        let decimals: u32 = read_asset_decimals(&env);
        let result_pow: i128 = safe_pow(10_i128, decimals);
        let result: i128 = safe_div(amount, result_pow);
        result
    }

    fn _convert_to_shares(
        env: &Env,
        assets: i128,
        rounding: Rounding,
    ) -> Result<i128, ContractError> {
        if assets <= 0 {
            Ok(0) // Assume it is fine to return zero here
        } else {
            let tot_shares: i128 = Self::total_shares(env)?;
            let tot_assets: i128 = Self::total_assets(env)?;
            let result: i128 = mul_div(
                assets,
                safe_add_i128(tot_shares, safe_pow(10, Self::_decimals_offset())),
                safe_add_i128(tot_assets, 1),
                rounding,
            );
            Ok(result)
        }
    }

    // Called to calculate potential return of value
    fn _convert_to_shares_simulate(
        assets: i128,
        total_assets: i128,
        total_shares: i128,
        rounding: Rounding,
    ) -> Result<i128, ContractError> {
        if assets <= 0 || total_assets <= assets || total_shares <= 0 {
            Ok(0) // Assume it is fine to return zero here
        } else {
            let result: i128 = mul_div(
                assets,
                safe_add_i128(total_shares, safe_pow(10, Self::_decimals_offset())),
                safe_add_i128(total_assets, 1),
                rounding,
            );
            Ok(result)
        }
    }

    fn _convert_to_assets(
        env: &Env,
        shares: i128,
        rounding: Rounding,
    ) -> Result<i128, ContractError> {
        if shares <= 0 {
            Ok(0) // Assume it is fine to return zero here
        } else {
            let tot_shares: i128 = Self::total_shares(env)?;
            let tot_assets: i128 = Self::total_assets(env)?;
            let result: i128 = mul_div(
                shares,
                safe_add_i128(tot_assets, 1),
                safe_add_i128(tot_shares, safe_pow(10, Self::_decimals_offset())),
                rounding,
            );
            Ok(result)
        }
    }

    // Called to calculate potential return of value
    fn _convert_to_assets_simulate(
        shares: i128,
        total_shares: i128,
        total_assets: i128,
        rounding: Rounding,
    ) -> Result<i128, ContractError> {
        if shares <= 0 || total_shares <= shares || total_assets <= 0 {
            Ok(0) // Assume it is fine to return zero here
        } else {
            let result: i128 = mul_div(
                shares,
                safe_add_i128(total_assets, 1),
                safe_add_i128(total_shares, safe_pow(10, Self::_decimals_offset())),
                rounding,
            );
            Ok(result)
        }
    }

    /*
       While multiple users can call the Soroban's contract concurrently, each transaction's storage operations are atomic.
       The contract's storage can only be in a valid state before and after each transaction.
       If two transactions try to modify the same storage simultaneously, Soroban's consensus mechanism ensures they're processed sequentially.

       In Soroban, storage operations within a single contract invocation are atomic - the entire transaction either succeeds or fails.
       However, it's still important to handle concurrent invocations properly.
    */

    fn _mint_shares(_env: &Env, _receiver: &Address, _shares: i128) -> () {
        let current_total = read_total_shares(&_env);
        let receiver_shares = read_total_shares_of(&_env, _receiver.clone());
        write_total_shares(&_env, &safe_add_i128(current_total, _shares));
        write_total_shares_of(
            &_env,
            _receiver.clone(),
            &safe_add_i128(receiver_shares, _shares),
        );
    }

    fn _burn_shares(_env: &Env, _owner: &Address, _shares: i128) -> () {
        let owner_shares = read_total_shares_of(&_env, _owner.clone());
        let current_total = read_total_shares(&_env);
        write_total_shares(&_env, &safe_sub_i128(current_total, _shares));
        write_total_shares_of(&_env, _owner.clone(), &safe_sub_i128(owner_shares, _shares));
    }

    fn _ensure_contract_not_paused(_env: &Env) {
        if is_paused(_env) {
            panic!("Contract is currently paused!");
        }
    }

    fn _ensure_deposit_not_paused(_env: &Env) {
        if deposit_paused(_env) {
            panic!("Deposit is currently paused!");
        }
    }

    fn _ensure_withdraw_not_paused(_env: &Env) {
        if withdraw_paused(_env) {
            panic!("Withdraw is currently paused!");
        }
    }

    fn _ensure_not_locked(_env: &Env) {
        let current_timestamp: u64 = _env.ledger().timestamp();
        let lock_timestamp: u64 = read_lock_timestamp(&_env);
        let unlock_timestamp: u64 = read_unlock_timestamp(&_env);
        if current_timestamp >= lock_timestamp && current_timestamp <= unlock_timestamp {
            panic!("New deposits and withdrawals are not possible as vault is currently locked!");
        }
    }

    fn _deposit(
        _env: &Env,
        _caller: &Address,
        _receiver: &Address,
        _assets: i128,
        _shares: i128,
    ) -> () {
        // Assume that here we receive already valid parameters, i.e. caller is authorized, amounts are validated and so on
        Self::_ensure_contract_not_paused(_env);
        Self::_ensure_deposit_not_paused(_env);
        Self::_ensure_not_locked(_env);
        let asset_address: Address = read_asset_address(_env);
        let token_client = token::Client::new(_env, &asset_address);
        let result: i128 = Self::_multiply_by_decimals(&_env, _assets);
        let balance: i128 = token_client.balance(&_caller);
        if balance < result {
            panic!("Insufficient balance")
        }
        // Transfer underlying assets from caller to vault
        // This must happen before minting shares to prevent reentrancy issues
        token_client.transfer(&_caller, &Self::contract_address(_env), &result);
        // Mint new share tokens to receiver, update total shares and receiver's shares
        Self::_mint_shares(&_env, &_receiver, _shares);
        // Emit event
        Self::_emit_deposit_event(_env, _caller, _receiver, _assets, _shares);
    }

    fn _withdraw(
        _env: &Env,
        _caller: &Address,
        _receiver: &Address,
        _owner: &Address,
        _assets: i128,
        _shares: i128,
    ) -> () {
        // Assume that here we receive already valid parameters, i.e. caller is authorized, amounts are validated and so on
        Self::_ensure_contract_not_paused(_env);
        Self::_ensure_withdraw_not_paused(_env);
        Self::_ensure_not_locked(_env);
        // Spend allowance
        if _caller != _owner {
            _spend_allowance(&_env, &_owner, &_caller, _shares).unwrap();
        }
        let asset_address: Address = read_asset_address(_env);
        let token_client = token::Client::new(_env, &asset_address);
        let result: i128 = Self::_multiply_by_decimals(&_env, _assets);
        let balance: i128 = token_client.balance(&Self::contract_address(_env));
        if balance < result {
            panic!("Insufficient balance")
        }
        // Burn share tokens from owner, update total shares and owner's shares
        // This must happen before transferring assets to prevent reentrancy
        Self::_burn_shares(&_env, _owner, _shares);
        // Transfer underlying assets from vault to receiver
        token_client.transfer(&Self::contract_address(_env), &_receiver, &result);
        // Emit event
        Self::_emit_withdraw_event(_env, _caller, _receiver, _owner, _assets, _shares);
    }

    fn _emit_initialized_event(
        env: &Env,
        admin: &Address,
        asset: &Address,
        name: String,
        symbol: String,
        decimals: u32,
    ) {
        let topics = (symbol_short!("init"), admin);
        env.events()
            .publish(topics, (asset, name, symbol, decimals));
    }

    fn _emit_transfer_shares_event(env: &Env, owner: &Address, receiver: &Address, shares: i128) {
        let topics = (symbol_short!("shares"), owner, receiver);
        env.events().publish(topics, shares);
    }

    fn _emit_deposit_event(
        env: &Env,
        caller: &Address,
        receiver: &Address,
        assets: i128,
        shares: i128,
    ) {
        let topics = (symbol_short!("deposit"), caller, receiver);
        env.events().publish(topics, (assets, shares));
    }

    fn _emit_withdraw_event(
        env: &Env,
        caller: &Address,
        receiver: &Address,
        owner: &Address,
        assets: i128,
        shares: i128,
    ) {
        let topics = (symbol_short!("withdraw"), caller, receiver, owner);
        env.events().publish(topics, (assets, shares));
    }

    fn _decimals_offset() -> u32 {
        0
    }
}
