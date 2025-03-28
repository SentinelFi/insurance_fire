use soroban_sdk::{Address, Env, String};

use crate::keys::{MarketDataKey, MarketRisk, MarketStatus};

// Use Instance or Persistent storage

pub fn has_administrator(e: &Env) -> bool {
    let key = MarketDataKey::AdminAddress;
    e.storage().instance().has(&key)
}

pub fn read_administrator(e: &Env) -> Address {
    let key = MarketDataKey::AdminAddress;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_administrator(e: &Env, address: &Address) {
    let key = MarketDataKey::AdminAddress;
    e.storage().instance().set(&key, address);
}

pub fn read_status(e: &Env) -> MarketStatus {
    let key = MarketDataKey::Status;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_status(e: &Env, status: &MarketStatus) {
    let key = MarketDataKey::Status;
    e.storage().instance().set(&key, status);
}

pub fn read_asset(e: &Env) -> Address {
    let key = MarketDataKey::AssetAddress;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_asset(e: &Env, address: &Address) {
    let key = MarketDataKey::AssetAddress;
    e.storage().instance().set(&key, address);
}

pub fn read_hedge_vault(e: &Env) -> Address {
    let key = MarketDataKey::HedgeAddress;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_hedge_vault(e: &Env, address: &Address) {
    let key = MarketDataKey::HedgeAddress;
    e.storage().instance().set(&key, address);
}

pub fn read_risk_vault(e: &Env) -> Address {
    let key = MarketDataKey::RiskAddress;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_risk_vault(e: &Env, address: &Address) {
    let key = MarketDataKey::RiskAddress;
    e.storage().instance().set(&key, address);
}

pub fn read_oracle_address(e: &Env) -> Address {
    let key = MarketDataKey::OracleAddress;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_oracle_address(e: &Env, address: &Address) {
    let key = MarketDataKey::OracleAddress;
    e.storage().instance().set(&key, address);
}

pub fn read_oracle_name(e: &Env) -> String {
    let key = MarketDataKey::OracleName;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_oracle_name(e: &Env, name: &String) {
    let key = MarketDataKey::OracleName;
    e.storage().instance().set(&key, name);
}

pub fn read_name(e: &Env) -> String {
    let key = MarketDataKey::Name;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_name(e: &Env, name: &String) {
    let key = MarketDataKey::Name;
    e.storage().instance().set(&key, name);
}

pub fn read_description(e: &Env) -> String {
    let key = MarketDataKey::Description;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_description(e: &Env, description: &String) {
    let key = MarketDataKey::Description;
    e.storage().instance().set(&key, description);
}

pub fn read_initialized_time(e: &Env) -> u64 {
    let key = MarketDataKey::InitializedTime;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_initialized_time(e: &Env, time: &u64) {
    let key = MarketDataKey::InitializedTime;
    e.storage().instance().set(&key, time);
}

pub fn has_liquidated_time(e: &Env) -> bool {
    let key = MarketDataKey::LiquidatedTime;
    e.storage().instance().has(&key)
}

pub fn read_liquidated_time(e: &Env) -> u64 {
    let key = MarketDataKey::LiquidatedTime;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_liquidated_time(e: &Env, time: &u64) {
    let key = MarketDataKey::LiquidatedTime;
    e.storage().instance().set(&key, time);
}

pub fn has_matured_time(e: &Env) -> bool {
    let key = MarketDataKey::MaturedTime;
    e.storage().instance().has(&key)
}

pub fn read_matured_time(e: &Env) -> u64 {
    let key = MarketDataKey::MaturedTime;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_matured_time(e: &Env, time: &u64) {
    let key = MarketDataKey::MaturedTime;
    e.storage().instance().set(&key, time);
}

pub fn has_last_oracle_time(e: &Env) -> bool {
    let key = MarketDataKey::LastOracleTime;
    e.storage().instance().has(&key)
}

pub fn read_last_oracle_time(e: &Env) -> u64 {
    let key = MarketDataKey::LastOracleTime;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_last_oracle_time(e: &Env, time: &u64) {
    let key = MarketDataKey::LastOracleTime;
    e.storage().instance().set(&key, time);
}

pub fn has_last_keeper_time(e: &Env) -> bool {
    let key = MarketDataKey::LastKeeperTime;
    e.storage().instance().has(&key)
}

pub fn read_last_keeper_time(e: &Env) -> u64 {
    let key = MarketDataKey::LastKeeperTime;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_last_keeper_time(e: &Env, time: &u64) {
    let key = MarketDataKey::LastKeeperTime;
    e.storage().instance().set(&key, time);
}

pub fn read_commission_fee(e: &Env) -> u32 {
    let key = MarketDataKey::CommissionFee;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_commission_fee(e: &Env, fee: &u32) {
    let key = MarketDataKey::CommissionFee;
    e.storage().instance().set(&key, fee);
}

pub fn read_risk_score(e: &Env) -> MarketRisk {
    let key = MarketDataKey::RiskScore;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_risk_score(e: &Env, risk: &MarketRisk) {
    let key = MarketDataKey::RiskScore;
    e.storage().instance().set(&key, risk);
}

pub fn read_is_automatic(e: &Env) -> bool {
    let key = MarketDataKey::IsAutomatic;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_is_automatic(e: &Env, auto: &bool) {
    let key = MarketDataKey::IsAutomatic;
    e.storage().instance().set(&key, auto);
}

pub fn read_event_timestamp(e: &Env) -> u64 {
    let key = MarketDataKey::EventUnixTimestamp;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_event_timestamp(e: &Env, time: &u64) {
    let key = MarketDataKey::EventUnixTimestamp;
    e.storage().instance().set(&key, time);
}

pub fn has_actual_event_timestamp(e: &Env) -> bool {
    let key = MarketDataKey::ActualEventUnixTimestamp;
    e.storage().instance().has(&key)
}

pub fn read_actual_event_timestamp(e: &Env) -> u64 {
    let key = MarketDataKey::ActualEventUnixTimestamp;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_actual_event_timestamp(e: &Env, time: &u64) {
    let key = MarketDataKey::ActualEventUnixTimestamp;
    e.storage().instance().set(&key, time);
}

pub fn read_lock_seconds(e: &Env) -> u64 {
    let key = MarketDataKey::LockInSeconds;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_lock_seconds(e: &Env, lock: &u64) {
    let key = MarketDataKey::LockInSeconds;
    e.storage().instance().set(&key, lock);
}

pub fn read_event_threshold_seconds(e: &Env) -> u64 {
    let key = MarketDataKey::EventThresholdInSeconds;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_event_threshold_seconds(e: &Env, threshold: &u64) {
    let key = MarketDataKey::EventThresholdInSeconds;
    e.storage().instance().set(&key, threshold);
}

pub fn read_unlock_seconds(e: &Env) -> u64 {
    let key = MarketDataKey::UnlockInSeconds;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_unlock_seconds(e: &Env, unlock: &u64) {
    let key = MarketDataKey::UnlockInSeconds;
    e.storage().instance().set(&key, unlock);
}

pub fn is_paused(e: &Env) -> bool {
    let key = MarketDataKey::IsPaused;
    e.storage().instance().has(&key)
}

pub fn write_is_paused(e: &Env) {
    let key = MarketDataKey::IsPaused;
    e.storage().instance().set(&key, &())
}

pub fn remove_is_paused(e: &Env) {
    let key = MarketDataKey::IsPaused;
    e.storage().instance().remove(&key);
}

// Call extend_contract_ttl or extend_persistence_ttl

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
pub fn extend_persistence_ttl(env: &Env, key: MarketDataKey, threshold: u32, extend_to: u32) {
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
