use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum MarketError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    InvalidUnixTimestamp = 3,
    HedgeAndRiskAddressesAreSame = 4,
    InvalidCommisionFee = 5,
    InvalidLockPeriod = 6,
    NotImplementedYet = 7,
    HedgeVaultInitializationFailed = 8,
    HedgeVaultAllowanceFailed = 9,
    RiskVaultInitializationFailed = 10,
    RiskVaultAllowanceFailed = 11,
    ContractIsAlreadyPaused = 12,
    ContractIsAlreadyUnpaused = 13,
    VaultPauseFailed = 14,
    VaultUnpauseFailed = 15,
    LockTooEarly = 16,
    NotLiquidate = 17,
    NotMature = 18,
    LastKeeperTimeNotSet = 19,
    LastOracleTimeNotSet = 20,
    AlreadyMatured = 21,
    AlreadyLiquidated = 22,
    AlreadyLocked = 23,
    EventTimeIsRequired = 24,
    WithdrawalUnpauseFailed = 25,
    InvalidEventThreshold = 26,
    InvalidUnlockPeriod = 27,
    InsufficientAllowance = 28,
    InsufficientAllowanceForFeeTransfer = 29,
    ActualEventTimeNotSet = 30,
    LiquidatedTimeNotSet = 31,
    MaturityTimeNotSet = 32,
}
