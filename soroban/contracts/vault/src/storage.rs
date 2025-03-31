use crate::{allowance::AllowanceData, keys::DataKey};
use soroban_sdk::{Address, Env, String};

/*
  Anything stored in instance storage has an archival TTL that is tied to the contract instance itself.
  So, if a contract is live and available, the instance storage is guaranteed to be so, too.
  Instance storage is really useful for global contract data that is shared among all users of the contract.
  Persistent storage can be very useful for ledger entrys that are not common across every user
  of the contract instance, but that are not suitable to be temporary (user balances, for example).
  Temporary storage is suitable for data that is only necessary for a relatively short and well-defined time period.
  The benefit of temporary storage is the smaller cost and the ability to set a very low TTL,
  both of which result in lower rent fees compared to persistent storage.
  https://developers.stellar.org/docs/build/guides/storage/choosing-the-right-storage
*/
pub fn has_administrator(e: &Env) -> bool {
    let key = DataKey::AdminAddress;
    e.storage().instance().has(&key)
}

pub fn read_administrator(e: &Env) -> Address {
    let key = DataKey::AdminAddress;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_administrator(e: &Env, address: &Address) {
    let key = DataKey::AdminAddress;
    e.storage().instance().set(&key, address);
}

pub fn write_asset_address(e: &Env, address: &Address) {
    let key = DataKey::AssetAddress;
    e.storage().instance().set(&key, address);
}

pub fn write_asset_name(e: &Env, name: &String) {
    let key = DataKey::AssetName;
    e.storage().instance().set(&key, name);
}

pub fn write_asset_symbol(e: &Env, symbol: &String) {
    let key = DataKey::AssetSymbol;
    e.storage().instance().set(&key, symbol);
}

pub fn write_asset_decimals(e: &Env, decimals: &u32) {
    let key = DataKey::AssetDecimals;
    e.storage().instance().set(&key, decimals);
}

pub fn write_total_shares(e: &Env, shares: &i128) {
    let key = DataKey::TotalShares;
    e.storage().instance().set(&key, shares);
}

pub fn write_total_shares_of(e: &Env, adress: Address, shares: &i128) {
    let key = DataKey::TotalSharesOf(adress);
    e.storage().instance().set(&key, shares);
}

pub fn read_asset_decimals(e: &Env) -> u32 {
    let key = DataKey::AssetDecimals;
    e.storage().instance().get(&key).unwrap()
}

pub fn read_asset_symbol(e: &Env) -> String {
    let key = DataKey::AssetSymbol;
    e.storage().instance().get(&key).unwrap()
}

pub fn read_asset_name(e: &Env) -> String {
    let key = DataKey::AssetName;
    e.storage().instance().get(&key).unwrap()
}

pub fn read_asset_address(e: &Env) -> Address {
    let key = DataKey::AssetAddress;
    e.storage().instance().get(&key).unwrap()
}

pub fn read_total_shares(e: &Env) -> i128 {
    let key = DataKey::TotalShares;
    e.storage().instance().get(&key).unwrap()
}

pub fn read_total_shares_of(e: &Env, address: Address) -> i128 {
    let key = DataKey::TotalSharesOf(address);
    e.storage().instance().get(&key).unwrap_or(0)
}

pub fn read_allowance(e: &Env, owner: Address, spender: Address) -> Option<AllowanceData> {
    let key = DataKey::Allowance(owner.clone(), spender.clone());
    e.storage().instance().get(&key)
}

pub fn write_allowance(e: &Env, owner: Address, spender: Address, allowance: AllowanceData) {
    let key = DataKey::Allowance(owner.clone(), spender.clone());
    e.storage().instance().set(&key, &allowance);
}

pub fn remove_allowance(e: &Env, owner: Address, spender: Address) {
    let key = DataKey::Allowance(owner.clone(), spender.clone());
    e.storage().instance().remove(&key);
}

pub fn is_paused(e: &Env) -> bool {
    let key = DataKey::IsPaused;
    e.storage().instance().has(&key)
}

pub fn write_paused(e: &Env) {
    let key = DataKey::IsPaused;
    e.storage().instance().set(&key, &())
}

pub fn remove_paused(e: &Env) {
    let key = DataKey::IsPaused;
    e.storage().instance().remove(&key);
}

pub fn deposit_paused(e: &Env) -> bool {
    let key = DataKey::DepositPaused;
    e.storage().instance().has(&key)
}

pub fn write_deposit_paused(e: &Env) {
    let key = DataKey::DepositPaused;
    e.storage().instance().set(&key, &())
}

pub fn remove_deposit_paused(e: &Env) {
    let key = DataKey::DepositPaused;
    e.storage().instance().remove(&key);
}

pub fn withdraw_paused(e: &Env) -> bool {
    let key = DataKey::WithdrawPaused;
    e.storage().instance().has(&key)
}

pub fn write_withdraw_paused(e: &Env) {
    let key = DataKey::WithdrawPaused;
    e.storage().instance().set(&key, &())
}

pub fn remove_withdraw_paused(e: &Env) {
    let key = DataKey::WithdrawPaused;
    e.storage().instance().remove(&key);
}

pub fn read_lock_timestamp(e: &Env) -> u64 {
    let key = DataKey::LockTimestamp;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_lock_timestamp(e: &Env, time: &u64) {
    let key = DataKey::LockTimestamp;
    e.storage().instance().set(&key, time);
}

pub fn read_unlock_timestamp(e: &Env) -> u64 {
    let key = DataKey::UnlockTimestamp;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_unlock_timestamp(e: &Env, time: &u64) {
    let key = DataKey::UnlockTimestamp;
    e.storage().instance().set(&key, time);
}

/*
  State archival is a special mechanism defined by the Stellar protocol that ensures
  that the active ledger state size doesn't grow indefinitely.
  In simple terms, every stored contract data entry, as well as contract code (Wasm) entry,
  has a certain 'time-to-live' (TTL) assigned.
  The TTL is the number of ledgers between the current ledger and the final ledger for which the contract data can still be accessed.
  If the TTL expires, the contract's code becomes archived and inaccessible.
  To prevent this, you need to periodically extend the TTL of the contract's Wasm code.
  When you extend a contract instance, this includes:
  - the contract instance itself
  - any env.storage().instance() entries in the contract
  - the contract's Wasm code
  Assume averaging 5 second ledger close times.
  For instance, 535679 LEDGERS would correspond to ~31 DAYS * 24 HOURS * 60 MINUTES * 60 SECONDS / 5 SECONDS average.
  threshold is a check that ensures that the current TTL of the contract instance is less than the set threshold value.
  extend_to is the number of ledgers to be added to the current TTL.
*/
#[allow(dead_code)]
const DAY_IN_LEDGERS: u32 = 17280; // One day, assuming 5s per ledger: 24 * 60 * 60 / 5
#[allow(dead_code)]
const MAXIMUM_EXTEND_DAYS: u32 = 30; // One month
#[allow(dead_code)]
pub const EXTEND_TO_DAYS: u32 = MAXIMUM_EXTEND_DAYS * DAY_IN_LEDGERS; // Extend TTL to maximum 30 days
#[allow(dead_code)]
pub const BUMP_THRESHOLD: u32 = EXTEND_TO_DAYS - DAY_IN_LEDGERS; // One day threshold

#[allow(dead_code)]
pub fn extend_contract_ttl(env: &Env, threshold: u32, extend_to: u32) {
    env.storage().instance().extend_ttl(threshold, extend_to);
}

#[allow(dead_code)]
pub fn extend_persistence_ttl(env: &Env, key: DataKey, threshold: u32, extend_to: u32) {
    env.storage()
        .persistent()
        .extend_ttl(&key, threshold, extend_to);
}

#[allow(dead_code)]
pub fn extend_persistence_all_ttl(_env: &Env, _threshold: u32, _extend_to: u32) {
    // call extend_persistence_ttl (above) with persistence keys one by one
    // currently no key is stored in persistence, only in instance
    // .. add more as needed
}
