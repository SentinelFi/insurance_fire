use soroban_sdk::{Address, Env, String};

use crate::errors::{ContractError, VaultError};

pub trait IPublicVault {
    fn initialize(
        env: Env,
        admin: Address,
        asset_address: Address,
        lock_timestamp: u64,
        unlock_timestamp: u64,
    ) -> Result<(String, String, u32), ContractError>;
    fn administrator_address(env: &Env) -> Result<Address, ContractError>;
    fn asset_decimals(env: &Env) -> Result<u32, ContractError>;
    fn asset_symbol(env: &Env) -> Result<String, ContractError>;
    fn asset_name(env: &Env) -> Result<String, ContractError>;
    fn asset_address(env: &Env) -> Result<Address, ContractError>;
    fn contract_address(env: &Env) -> Address;
    fn total_assets(env: &Env) -> Result<i128, ContractError>;
    fn total_shares(env: &Env) -> Result<i128, ContractError>;
    fn balance_of_shares(env: &Env, address: Address) -> Result<i128, ContractError>;
    fn lock_timestamp(env: Env) -> Result<u64, ContractError>;
    fn unlock_timestamp(env: Env) -> Result<u64, ContractError>;
    fn convert_to_shares(env: &Env, assets: i128) -> Result<i128, ContractError>;
    fn convert_to_assets(env: &Env, shares: i128) -> Result<i128, ContractError>;
    fn convert_to_shares_simulate(
        _env: &Env,
        assets: i128,
        total_assets: i128,
        total_shares: i128,
    ) -> Result<i128, ContractError>;
    fn convert_to_assets_simulate(
        _env: &Env,
        shares: i128,
        total_shares: i128,
        total_assets: i128,
    ) -> Result<i128, ContractError>;
    fn max_deposit(_: &Env, _address: Address) -> i128;
    fn max_mint(_: &Env, _address: Address) -> i128;
    fn max_withdraw(env: &Env, owner: Address) -> i128;
    fn max_redeem(env: &Env, owner: Address) -> i128;
    fn preview_deposit(env: &Env, assets: i128) -> Result<i128, ContractError>;
    fn preview_mint(env: &Env, shares: i128) -> Result<i128, ContractError>;
    fn preview_withdraw(env: &Env, assets: i128) -> Result<i128, ContractError>;
    fn preview_redeem(env: &Env, shares: i128) -> Result<i128, ContractError>;
    fn deposit(
        env: Env,
        assets: i128,
        caller: Address,
        receiver: Address,
    ) -> Result<i128, VaultError>;
    fn mint(env: Env, shares: i128, caller: Address, receiver: Address)
        -> Result<i128, VaultError>;
    fn withdraw(
        env: Env,
        assets: i128,
        caller: Address,
        receiver: Address,
        owner: Address,
    ) -> Result<i128, VaultError>;
    fn redeem(
        env: Env,
        shares: i128,
        caller: Address,
        receiver: Address,
        owner: Address,
    ) -> Result<i128, VaultError>;
    fn approve_shares(
        env: Env,
        owner: Address,
        spender: Address,
        approve_amount: i128,
        expire_in_days: u32,
    ) -> Result<bool, VaultError>;
    fn transfer_shares(
        env: Env,
        owner: Address,
        receiver: Address,
        shares_amount: i128,
    ) -> Result<bool, VaultError>;
    fn approve_asset_allowance(
        env: Env,
        asset_address: Address,
        spender: Address,
        approve_amount: i128,
        expiration_ledger: u32,
    ) -> Result<(), VaultError>;
    fn is_paused(env: Env) -> bool;
    fn pause(env: Env) -> Result<bool, ContractError>;
    fn unpause(env: Env) -> Result<bool, ContractError>;
    fn pause_deposit(env: Env) -> Result<bool, ContractError>;
    fn pause_withdrawal(env: Env) -> Result<bool, ContractError>;
    fn unpause_withdrawal(env: Env) -> Result<bool, ContractError>;
    fn unpause_deposit(env: Env) -> Result<bool, ContractError>;
    fn extend_vault_ttl(env: &Env) -> Result<bool, ContractError>;
}
