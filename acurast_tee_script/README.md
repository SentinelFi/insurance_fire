# Wildfire Detection Oracle for Soroban

This project implements an Acurast TEE (Trusted Execution Environment) script that checks for wildfires at specified locations using NASA's FIRMS API and reports those fires to a Soroban smart contract on the Stellar blockchain.

## Features

- Geocodes addresses to latitude/longitude coordinates using Nominatim API
- Checks for recent wildfires at those coordinates using NASA FIRMS API
- Reports any detected fires to a Soroban smart contract
- Designed to run in Acurast's TEE environment for secure and trusted execution

## Prerequisites

- Node.js (v14+)
- An API key from NASA FIRMS
- A deployed Soroban contract with a `reportFire()` function
- Stellar account with funds for transaction fees

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   NASA_FIRMS_API_KEY=your_firms_api_key
   DAYS_TO_CHECK=10
   SOURCE=VIIRS_SNPP_NRT
   CONTRACT_ID=your_soroban_contract_id
   SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
   NETWORK_PASSPHRASE=Test SDF Network ; September 2015
   SECRET_KEY=your_stellar_account_secret_key
   LOCATION_TO_CHECK="Your address to check"
   ```

## Running the Script

```bash
npm run start
```

## Project Structure

- `src/index.ts` - Main entry point with wildfire checking logic
- `src/soroban-contract.ts` - Reference implementation for Soroban contract integration

## Soroban Contract Integration

The script is designed to call a `reportFire()` function on a Soroban smart contract. The function should accept the following parameters:

- `address` (string) - The human-readable address where the fire was detected
- `lat` (int32) - Latitude scaled by 1,000,000 (i.e., 37.7749 becomes 37774900)
- `lon` (int32) - Longitude scaled by 1,000,000 (i.e., -122.4194 becomes -122419400)
- `confidence` (string) - Confidence level of the fire detection
- `date` (string) - Date of the fire detection (YYYY-MM-DD format)

## Acurast TEE Integration

This script is designed to run in the Acurast TEE environment, which ensures:

1. Secure execution in an isolated environment
2. Tamper-proof execution of the code
3. Reliable and scheduled execution
4. Cryptographic proof of execution results

## Custom Configuration

You can adjust the following parameters in the `.env` file:

- `DAYS_TO_CHECK` - Number of days to look back for fires (1-10)
- `SOURCE` - Fire detection satellite source:
  - `VIIRS_SNPP_NRT` - Suomi NPP satellite (near real-time, default)
  - `VIIRS_NOAA20_NRT` - NOAA-20 satellite (near real-time)
  - `VIIRS_NOAA21_NRT` - NOAA-21 satellite (near real-time)
  - `VIIRS_SNPP_SP` - Suomi NPP satellite (standard processing)
  - `VIIRS_NOAA20_SP` - NOAA-20 satellite (standard processing)

## Notes on Soroban Integration

- The current implementation includes a placeholder for the actual contract call.
- To implement the full Soroban integration, uncomment and adapt the code in `soroban-contract.ts` based on your specific contract interface and Stellar SDK version.
- The code provides two implementation approaches:
  1. Using the Client API (from newer SDK versions)
  2. Direct transaction creation (for older SDK versions or more control)

## License

MIT

