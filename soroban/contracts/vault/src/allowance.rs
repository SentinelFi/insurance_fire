use soroban_sdk::{contracttype, symbol_short, Address, Env};

use crate::{
    errors::VaultError,
    storage::{read_allowance, remove_allowance, write_allowance},
};

#[derive(Clone)]
#[contracttype]
pub struct AllowanceData {
    amount: i128,
    expiry_ledger: u32,
}

const DAY_IN_LEDGERS: u32 = 17280; // Assuming 5s per ledger: 24 * 60 * 60 / 5
const MAXIMUM_DAYS: u32 = 30;
const MAXIMUM_LEDGERS: u32 = MAXIMUM_DAYS * DAY_IN_LEDGERS; // 30 days maximum

pub(crate) fn _calculate_expiry_ledger(env: &Env, days: u32) -> Result<u32, VaultError> {
    if days <= 0 || days > MAXIMUM_DAYS {
        Err(VaultError::InvalidExpiryDays)
    } else {
        let ledgers: u32 = days.checked_mul(DAY_IN_LEDGERS).unwrap();
        let expiry: u32 = env.ledger().sequence().checked_add(ledgers).unwrap();
        Ok(expiry)
    }
}

fn _get_min_expiry_ledger(env: &Env) -> u32 {
    env.ledger().sequence().checked_add(1).unwrap()
}

fn _get_max_expiry_ledger(env: &Env) -> u32 {
    env.ledger()
        .sequence()
        .checked_add(MAXIMUM_LEDGERS)
        .unwrap()
}

pub(crate) fn _approve_allowance(
    env: &Env,
    owner: &Address,
    spender: &Address,
    amount: i128,
    expiry_ledger: u32,
) -> Result<(), VaultError> {
    // Assume that owner is already authorized here
    let min_expiry: u32 = _get_min_expiry_ledger(env);
    let max_expiry: u32 = _get_max_expiry_ledger(env);

    if expiry_ledger < min_expiry || expiry_ledger > max_expiry {
        Err(VaultError::InvalidExpiry)
    } else {
        let allowance = AllowanceData {
            amount,
            expiry_ledger,
        };

        write_allowance(&env, owner.clone(), spender.clone(), allowance);
        _emit_approval_event(&env, &owner, &spender, amount, expiry_ledger);

        Ok(())
    }
}

pub(crate) fn _spend_allowance(
    env: &Env,
    owner: &Address,
    spender: &Address,
    amount: i128,
) -> Result<(), VaultError> {
    let allowance: AllowanceData =
        read_allowance(env, owner.clone(), spender.clone()).ok_or(VaultError::NoAllowance)?;

    if env.ledger().sequence() > allowance.expiry_ledger {
        Err(VaultError::AllowanceExpired)
    } else {
        if amount > allowance.amount {
            Err(VaultError::InsufficientAllowance)
        } else {
            let new_allowance_amount = allowance
                .amount
                .checked_sub(amount)
                .ok_or(VaultError::InsufficientAllowance)?;

            if new_allowance_amount > 0 {
                let new_allowance_data = AllowanceData {
                    amount: new_allowance_amount,
                    expiry_ledger: allowance.expiry_ledger,
                };
                write_allowance(env, owner.clone(), spender.clone(), new_allowance_data);
            } else {
                remove_allowance(&env, owner.clone(), spender.clone());
            }

            Ok(())
        }
    }
}

fn _emit_approval_event(
    env: &Env,
    owner: &Address,
    spender: &Address,
    amount: i128,
    expiry_ledger: u32,
) {
    let topics = (symbol_short!("approve"), owner, spender);
    env.events().publish(topics, (amount, expiry_ledger));
}
