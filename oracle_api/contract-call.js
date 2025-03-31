import { callMarketBump } from "./soroban.js";

async function main() {
  console.log("Starting script execution...");
  try {
    const _ = await callMarketBump(); // Adjust configuration (contract id, etc.) in soroban.js file
  } catch (error) {
    console.error("An error occurred:", error);
  }
  console.log("Script execution completed.");
}

main().catch((error) => {
  console.error("Unhandled error in main:", error);
  process.exit(1);
});
