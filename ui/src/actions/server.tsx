"use server";

import { converter } from "@/lib/converter";
import {
  BASE_FEE,
  Contract,
  Networks,
  scValToNative,
  Transaction,
  TransactionBuilder,
  xdr,
} from "@stellar/stellar-sdk";
import { Api, Server } from "@stellar/stellar-sdk/rpc";

const SERVER = new Server("https://soroban-testnet.stellar.org:443");
const NETWORK = Networks.TESTNET;
const POLL_INTERVAL_SEC = 1000;
const TIMEOUT_SEC = 30;

export async function prepareDepositVault(
  contractId: string,
  operationName: string,
  caller: string,
  receiver: string,
  assets: bigint
): Promise<string> {
  const params = [
    converter.toI128(assets),
    converter.stringToAddress(caller),
    converter.stringToAddress(receiver),
  ];
  return await prepareTransactionServer(
    caller,
    contractId,
    operationName,
    params
  );
}

export async function simulateGetAction(
  contractId: string,
  operationName: string,
  caller: string
): Promise<string | number | bigint | object> {
  return await simulateTransactionServer(caller, contractId, operationName);
}

export async function simulateTotalSharesOf(
  contractId: string,
  operationName: string,
  caller: string,
  address: string
): Promise<string | number | bigint | object> {
  const params = [converter.stringToAddress(address)];
  return await simulateTransactionServer(
    caller,
    contractId,
    operationName,
    params
  );
}

async function prepareTransactionServer(
  publicKey: string,
  contractId: string,
  operationName: string,
  operationParams: xdr.ScVal[]
): Promise<string> {
  console.log("[server] Prepare transaction");
  const account = await SERVER.getAccount(publicKey);
  const contract = new Contract(contractId);
  const operation = contract.call(operationName, ...operationParams);
  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
  })
    .setNetworkPassphrase(NETWORK)
    .setTimeout(TIMEOUT_SEC)
    .addOperation(operation)
    .build();
  console.log("[server] Preparing transaction...", transaction);
  const preparedTransaction = await SERVER.prepareTransaction(transaction);
  console.log(preparedTransaction);
  if (!preparedTransaction) throw "Empty prepare transaction response.";
  return preparedTransaction.toEnvelope().toXDR("base64");
}

export async function sendTransactionServer(
  signedTransaction: string
): Promise<boolean> {
  console.log("[server] Send transaction");

  const transaction = TransactionBuilder.fromXDR(
    signedTransaction,
    NETWORK
  ) as Transaction;

  console.log("[server] Sending transaction...");
  const sent = await SERVER.sendTransaction(transaction);
  console.log(sent);

  if (!sent) throw "Empty send transaction response.";

  if (sent.status !== "PENDING") {
    throw "Something went Wrong. Transaction status: " + sent.status;
  }

  const hash = sent.hash;
  let getResponse = await SERVER.getTransaction(hash);

  // Poll `getTransaction` until the status is not "NOT_FOUND"
  while (getResponse.status === "NOT_FOUND") {
    console.log("[server] Waiting for transaction confirmation...");
    getResponse = await SERVER.getTransaction(hash);
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_SEC));
  }

  if (getResponse.status === "SUCCESS") {
    // Make sure the transaction's resultMetaXDR is not empty
    if (!getResponse.resultMetaXdr) {
      throw "Empty resultMetaXDR in getTransaction response";
    }
  } else {
    throw `Transaction failed: ${getResponse.resultXdr}`;
  }

  const returnValue = getResponse.resultMetaXdr
    .v3()
    .sorobanMeta()
    ?.returnValue();

  console.log("[server] Return value:", returnValue);

  return true;
}

async function simulateTransactionServer(
  publicKey: string,
  contractId: string,
  operationName: string,
  operationParams?: xdr.ScVal[]
): Promise<string | number | bigint | object> {
  console.log("[server] Simulate transaction");

  const account = await SERVER.getAccount(publicKey);

  const contract = new Contract(contractId);

  const operation =
    operationParams && operationParams.length > 0
      ? contract.call(operationName, ...operationParams)
      : contract.call(operationName);

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
  })
    .setNetworkPassphrase(NETWORK)
    .setTimeout(TIMEOUT_SEC)
    .addOperation(operation)
    .build();

  const simulatedTransaction = await SERVER.simulateTransaction(transaction);

  if (!simulatedTransaction) throw "Empty simulate transaction response.";

  return handleSimulationResponse(simulatedTransaction);
}

function handleSimulationResponse(
  response: Api.SimulateTransactionResponse
): string | number | bigint {
  if (Api.isSimulationSuccess(response)) {
    if (response.result?.retval) {
      return scValToNative(response.result.retval);
    } else {
      throw "Return value not set";
    }
  } else if (Api.isSimulationError(response)) {
    console.log(response.error);
    throw response.error;
  } else {
    console.log(response);
    throw "Unexpected simulation response";
  }
}
