use crate::errors::ContractError;
use soroban_sdk::contracttype;

#[derive(Clone)]
#[contracttype]
pub enum Rounding {
    Floor,  // Toward negative infinity
    Ceil,   // Toward positive infinity
    Trunc,  // Toward zero
    Expand, // Away from zero
}

pub fn safe_add_u32(a: u32, b: u32) -> u32 {
    a.checked_add(b)
        .ok_or(ContractError::ArithmeticError)
        .unwrap()
}

pub fn safe_add_i128(a: i128, b: i128) -> i128 {
    a.checked_add(b)
        .ok_or(ContractError::ArithmeticError)
        .unwrap()
}

pub fn safe_sub_i128(a: i128, b: i128) -> i128 {
    a.checked_sub(b)
        .ok_or(ContractError::ArithmeticError)
        .unwrap()
}

pub fn safe_pow(a: i128, b: u32) -> i128 {
    a.checked_pow(b)
        .ok_or(ContractError::ArithmeticError)
        .unwrap()
}

pub fn safe_mul(a: i128, b: i128) -> i128 {
    a.checked_mul(b)
        .ok_or(ContractError::ArithmeticError)
        .unwrap()
}

pub fn safe_div(a: i128, b: i128) -> i128 {
    a.checked_div(b)
        .ok_or(ContractError::ArithmeticError)
        .unwrap()
}

pub fn mul_div(a: i128, b: i128, denominator: i128, _rounding: Rounding) -> i128 {
    // TODO: improve
    if a <= 0 || b <= 0 {
        0
    } else {
        let temp = safe_mul(a, b);
        let result = safe_div(temp, denominator);
        result
    }
}
