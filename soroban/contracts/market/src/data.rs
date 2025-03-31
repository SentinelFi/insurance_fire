use soroban_sdk::{contracttype, Address, String};

use crate::keys::{MarketRisk, MarketStatus};

#[derive(Clone)]
#[contracttype]
pub struct MarketData {
    pub name: String,
    pub description: String,
    pub admin_address: Address,
    pub asset_address: Address,
    pub trusted_oracle_name: String,
    pub trusted_oracle_address: Address,
    pub hedge_vault_address: Address,
    pub risk_vault_address: Address,
    pub commission_fee: u32,
    pub risk_score: MarketRisk,
    pub is_automatic: bool,
    pub event_unix_timestamp: u64,
    pub lock_period_in_seconds: u64,
    pub event_threshold_in_seconds: u64,
    pub unlock_period_in_seconds: u64,
}

#[derive(Clone)]
#[contracttype]
pub struct MarketDetails {
    pub name: String,
    pub description: String,
    pub status: MarketStatus,
    pub hedge_address: Address,
    pub risk_address: Address,
    pub oracle_address: Address,
    pub oracle_name: String,
    pub risk_score: MarketRisk,
    pub event_time: u64,
    pub is_automatic: bool,
    pub commission_fee: u32,
    pub hedge_admin_address: Address,
    pub hedge_asset_address: Address,
    pub hedge_asset_symbol: String,
    pub hedge_total_shares: i128,
    pub hedge_total_assets: i128,
    pub hedge_address_shares: i128,
    pub risk_admin_address: Address,
    pub risk_asset_address: Address,
    pub risk_asset_symbol: String,
    pub risk_total_shares: i128,
    pub risk_total_assets: i128,
    pub risk_address_shares: i128,
}
