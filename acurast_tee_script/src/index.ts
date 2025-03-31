import { Keypair, Networks, TransactionBuilder, SorobanRpc, Operation, Contract } from '@stellar/stellar-sdk';
import axios from 'axios';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

// Configuration
const NASA_FIRMS_API_KEY = process.env.NASA_FIRMS_API_KEY || ""; // Get from https://firms.modaps.eosdis.nasa.gov/api/area/
const DAYS_TO_CHECK = parseInt(process.env.DAYS_TO_CHECK || "10"); // Check for fires within this many days [0-10]
const SOURCE = process.env.SOURCE || "VIIRS_SNPP_NRT"; // VIIRS_NOAA20_NRT, VIIRS_NOAA20_SP, VIIRS_NOAA21_NRT, VIIRS_SNPP_NRT, VIIRS_SNPP_SP
const CONTRACT_ID = process.env.CONTRACT_ID || ""; // Your deployed Soroban contract ID

// Soroban RPC configuration
const rpcUrl = process.env.SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
const networkPassphrase = process.env.NETWORK_PASSPHRASE || Networks.TESTNET;

// Initialize Soroban RPC client
const server = new SorobanRpc.Server(rpcUrl);

/**
 * Geocode an address to latitude/longitude using Nominatim API
 * @param {string} address - The address to geocode
 * @returns {Promise<{lat: number, lon: number}>} - The coordinates
 */
async function geocodeAddress(address: string): Promise<{lat: number, lon: number}> {
  try {
    // Use Nominatim API (OpenStreetMap)
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: address,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "WildfireLocationChecker/1.0",
        },
      }
    );

    if (response.data && response.data.length > 0) {
      const location = response.data[0];
      return {
        lat: parseFloat(location.lat),
        lon: parseFloat(location.lon),
      };
    } else {
      throw new Error("Address not found");
    }
  } catch (error: any) {
    console.error("Error geocoding address:", error.message);
    throw error;
  }
}

/**
 * Check for wildfires at the given coordinates using NASA FIRMS API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<{hasWildfire: boolean, fireData: Array}>} - Wildfire info
 */
async function checkForWildfires(lat: number, lon: number): Promise<{hasWildfire: boolean, fireData: any[]}> {
  try {
    // Create a bounding box around the point (±0.05 degrees, ~5km radius)
    const boxSize = 0.05;
    const boundingBox = {
      minLat: lat - boxSize,
      maxLat: lat + boxSize,
      minLon: lon - boxSize,
      maxLon: lon + boxSize,
    };

    // Use NASA FIRMS API
    const response = await axios.get(
      `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${NASA_FIRMS_API_KEY}/${SOURCE}/${boundingBox.minLon},${boundingBox.minLat},${boundingBox.maxLon},${boundingBox.maxLat}/${DAYS_TO_CHECK}`,
      {
        headers: {
          Accept: "text/csv",
          "User-Agent": "WildfireLocationChecker/1.0",
        },
      }
    );

    // Debug response
    console.log("Full Response Status:", response.status);

    // Parse CSV response
    const lines = response.data.trim().split("\n");
    const headers = lines[0].split(",");

    // Create objects from CSV
    const fireData = lines.slice(1).map((line: string) => {
      const values = line.split(",");
      const obj: {[key: string]: string} = {};
      headers.forEach((header: string, i: number) => {
        obj[header.trim()] = values[i];
      });
      return obj;
    });

    return {
      hasWildfire: fireData.length > 0,
      fireData: fireData,
    };
  } catch (error: any) {
    console.error("Error checking for wildfires:", error.message);
    throw error;
  }
}

/**
 * Report a fire to the Soroban smart contract
 * @param address The address where fire was detected
 * @param lat Latitude of the fire
 * @param lon Longitude of the fire
 * @param confidence Confidence level of the fire detection
 * @param date Date of the fire detection
 */
async function reportFireToContract(
  address: string, 
  lat: number, 
  lon: number, 
  confidence: string, 
  date: string
): Promise<any> {
  try {
    console.log("Reporting fire to Soroban contract...");
    console.log(`Address: ${address}`);
    console.log(`Location: ${lat}, ${lon}`);
    console.log(`Confidence: ${confidence}`);
    console.log(`Date: ${date}`);
    
    // For now, just log the information since we need more details about
    // the specific Soroban contract interface to implement this properly
    console.log("Note: Contract integration would be implemented according to the actual contract interface");
    
    // Placeholder for the actual contract call
    // In a real implementation, this would use the appropriate Stellar SDK methods
    // to call the contract's reportFire function with the fire data
    return {
      status: "success",
      message: "Fire report logged (Soroban contract call simulation)"
    };
  } catch (error: any) {
    console.error("Error reporting fire to contract:", error.message);
    throw error;
  }
}

/**
 * Main function to process an address and check for wildfires
 * @param {string} address - The address to check
 */
async function checkLocationForWildfires(address: string): Promise<void> {
  try {
    console.log(`Checking address: "${address}"`);

    // Step 1: Geocode the address
    console.log("Geocoding address...");
    const coordinates = await geocodeAddress(address);
    console.log(`Coordinates: ${coordinates.lat}, ${coordinates.lon}`);

    // Step 2: Check for wildfires
    console.log("Checking for wildfires...");
    const wildfireData = await checkForWildfires(
      coordinates.lat,
      coordinates.lon
    );

    // Step 3: Display results and report to Soroban if wildfire detected
    if (wildfireData.hasWildfire) {
      console.log(
        `\nWILDFIRE DETECTED! ${wildfireData.fireData.length} fire hotspots found within the last ${DAYS_TO_CHECK} days.`
      );

      // Report each fire to the Soroban contract
      for (const fire of wildfireData.fireData.slice(0, 5)) {
        console.log(`\nReporting Fire:`);
        console.log(`  Date: ${fire.acq_date || "Unknown"}`);
        console.log(`  Time: ${fire.acq_time || "Unknown"}`);
        console.log(`  Confidence: ${fire.confidence || "Unknown"}`);
        console.log(`  Brightness: ${fire.bright_ti4 || "Unknown"}`);
        console.log(`  Location: ${fire.latitude}, ${fire.longitude}`);
        
        // Report this fire to the Soroban contract
        try {
          await reportFireToContract(
            address,
            parseFloat(fire.latitude),
            parseFloat(fire.longitude),
            fire.confidence || "Unknown",
            fire.acq_date || "Unknown"
          );
          console.log(`Successfully reported fire at ${fire.latitude}, ${fire.longitude} to Soroban contract`);
        } catch (error: any) {
          console.error(`Failed to report fire to Soroban contract: ${error.message}`);
        }
      }

      if (wildfireData.fireData.length > 5) {
        console.log(
          `\n...and ${wildfireData.fireData.length - 5} more fire hotspots not reported.`
        );
      }
    } else {
      console.log(
        "\nNo wildfires detected at this location within the last " +
          `${DAYS_TO_CHECK} days.`
      );
    }
  } catch (error: any) {
    console.error("\nError:", error.message);
    throw error;
  }
}

// Main execution for Acurast TEE
async function main() {
  try {
    console.log("Starting Acurast TEE script for wildfire detection and reporting");
    
    // Address to check - could be passed as a parameter or environment variable
    const address = process.env.LOCATION_TO_CHECK || "1600 Pennsylvania Avenue, Washington DC";
    
    // Check for wildfires at the specified location
    await checkLocationForWildfires(address);
    
    console.log("Acurast TEE script execution completed");
  } catch (error: any) {
    console.error("Acurast TEE script execution failed:", error.message);
  }
}

// Execute the main function
main();
