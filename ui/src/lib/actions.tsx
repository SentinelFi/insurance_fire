import { signTransactionClient } from "@/actions/client";
import {
  prepareDepositVault,
  sendTransactionServer,
  simulateGetAction,
  simulateTotalSharesOf,
} from "@/actions/server";

export async function deposit(
  vaultAddress: string,
  caller: string,
  receiver: string,
  assets: bigint
): Promise<boolean> {
  const prep = await prepareDepositVault(
    vaultAddress,
    "deposit",
    caller,
    receiver,
    assets
  );
  const sgn = await signTransactionClient(prep);
  return await sendTransactionServer(sgn);
}

export async function totalAssets(
  vaultAddress: string,
  caller: string
): Promise<string | number | bigint | object> {
  return await simulateGetAction(vaultAddress, "total_assets", caller);
}

export async function totalSharesOf(
  vaultAddress: string,
  caller: string,
  address: string
): Promise<string | number | bigint | object> {
  return await simulateTotalSharesOf(
    vaultAddress,
    "balance_of_shares",
    caller,
    address
  );
}
