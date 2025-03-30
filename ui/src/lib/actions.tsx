import { signTransactionClient } from "@/actions/client";
import { prepareDepositVault, sendTransactionServer } from "@/actions/server";

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
