import { Keypair } from "@stellar/stellar-sdk";
import { Client, basicNodeSigner } from "@stellar/stellar-sdk/contract";
import { Server } from "@stellar/stellar-sdk/rpc";

const rpcUrl = "https://soroban-testnet.stellar.org";
const networkPassphrase = "Test SDF Network ; September 2015";
const wasmHash =
  "bd3c43038d51193306a0d09fff37701a71650ea4efb16b84009241b8dc369ffc"; // Obtain after deploying market contract
const contractID = "CCOLNNMHQQEVYLFFKMMOQIZP4ARCJB4DDS23RTLV2YHAJO6MYXUCI7BB"; // E.g. Market contract address
const evenUnixTimestamp = 1743403241; // https://www.unixtimestamp.com/
const eventOccurred = true;

/**
 * Generate a random keypair and fund it
 */
async function generateFundedKeypair() {
  const keypair = Keypair.random();
  const server = new Server(rpcUrl);
  await server.requestAirdrop(keypair.publicKey());
  return keypair;
}

/**
 * Call a soroban contract function
 */
export async function callMarketBump() {
  console.log("Test wallet funding from faucet.");

  const sourceKeypair = await generateFundedKeypair();

  console.log("Signing init.");

  // If you are using a browser, you can pass in `signTransaction` from your
  // Wallet extension such as Freighter. If you're using Node, you can use
  // `signTransaction` from `basicNodeSigner`.
  const { signTransaction } = basicNodeSigner(sourceKeypair, networkPassphrase);

  console.log("Client init.");

  const client = await Client.from({
    contractId: contractID,
    networkPassphrase,
    rpcUrl,
    wasmHash,
    publicKey: sourceKeypair.publicKey(),
    signTransaction,
  });

  console.log("Bump write call.");

  try {
    const bumpTx = await client.bump({
      event_occurred: eventOccurred, // true or false
      event_time: evenUnixTimestamp, // unix timestamp
    });
    let { result: bumpResult } = await bumpTx.signAndSend();
    console.log("Bump result:", bumpResult);
  } catch (e) {
    console.log("Bump result:", e.message);
  }

  console.log("Status read call.");

  try {
    let { result: statusResult } = await client.status();
    console.log("Market status result:", statusResult);
  } catch (e) {
    console.log("Market status result:", e.message);
  }
}
