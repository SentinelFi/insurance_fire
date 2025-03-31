use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum VaultError {
    ERC4626ExceededMaxDeposit = 1,
    ERC4626ExceededMaxMint = 2,
    ERC4626ExceededMaxWithdraw = 3,
    ERC4626ExceededMaxRedeem = 4,
    InvalidAmount = 5,
    ZeroAssets = 6,
    ZeroShares = 7,
    NoAllowance = 8,
    InsufficientAllowance = 9,
    AllowanceExpired = 10,
    InvalidExpiry = 11,
    InvalidExpiryDays = 12,
    AdministratorError = 13,
    CannotApproveOrTransferToSelf = 14,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    ContractIsAlreadyPaused = 3,
    ContractIsAlreadyNotPaused = 4,
    DepositIsAlreadyPaused = 5,
    DepositIsAlreadyNotPaused = 6,
    WithdrawIsAlreadyPaused = 7,
    WithdrawIsAlreadyNotPaused = 8,
    InvalidLockTimes = 9,
    ArithmeticError = 10,
}
