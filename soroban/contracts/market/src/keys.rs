use soroban_sdk::contracttype;

#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
pub enum MarketStatus {
    LIVE = 0,
    MATURE = 1,
    MATURED = 2,
    LIQUIDATE = 3,
    LIQUIDATED = 4,
}

#[contracttype]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
pub enum MarketRisk {
    LOW = 0,
    MEDIUM = 1,
    HIGH = 2,
    UNKNOWN = 3,
}

#[derive(Clone)]
#[contracttype]
pub enum MarketDataKey {
    AdminAddress,
    AssetAddress,
    HedgeAddress,
    RiskAddress,
    OracleAddress,
    OracleName,
    Status,
    Name,
    Description,
    InitializedTime,
    LiquidatedTime,
    MaturedTime,
    LastOracleTime,
    LastKeeperTime,
    CommissionFee,
    RiskScore,
    IsAutomatic,
    EventUnixTimestamp,
    LockInSeconds,
    IsPaused,
    EventThresholdInSeconds,
    UnlockInSeconds,
    ActualEventUnixTimestamp,
}
