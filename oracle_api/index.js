/**
 * Fire Location Checker
 *
 * This Node.js script takes an address, converts it to latitude/longitude coordinates
 * using the Nominatim geocoder API, and then checks if there was a recent fire at that
 * location using the NASA FIRMS API.
 *
 * Usage: node index.js "123 Main St, City, State, Zip"
 */

import dotenv from "dotenv";
dotenv.config();

import axios from "axios";

// Configuration
const NASA_FIRMS_API_KEY = process.env.NASA_FIRMS_API_KEY || ""; // Get from https://firms.modaps.eosdis.nasa.gov/api/area/
const DAYS_TO_CHECK = process.env.DAYS_TO_CHECK || 10; // Check for fires within this many days [0-10]
const SOURCE = process.env.SOURCE || "VIIRS_SNPP_NRT"; // VIIRS_NOAA20_NRT, VIIRS_NOAA20_SP, VIIRS_NOAA21_NRT, VIIRS_SNPP_NRT, VIIRS_SNPP_SP

// console.log(
//   "API KEY - ",
//   NASA_FIRMS_API_KEY,
//   " - DAYS ",
//   DAYS_TO_CHECK,
//   " - Source ",
//   SOURCE
// );

/*
1. VIIRS_SNPP_NRT
    Satellite: Suomi-NPP (Suomi National Polar-orbiting Partnership)
    Processing: Near Real-Time (NRT) + Ultra Real-Time (URT)
    Best for: Latest fire detections (available within ~3 hours, with URT updates in under 60 seconds for the US/Canada).
    Coverage: Global

2. VIIRS_SNPP_SP
    Satellite: Suomi-NPP
    Processing: Standard Processing (SP)
    Best for: Higher-quality, scientifically validated data (released ~1–2 days later).
    Use case: Research, historical analysis.

3. VIIRS_NOAA20_NRT
    Satellite: NOAA-20 (JPSS-1)
    Processing: NRT + URT
    Best for: More frequent refreshes than SNPP (better for rapid monitoring).
    Note: Improved resolution over SNPP.

4. VIIRS_NOAA20_SP
    Satellite: NOAA-20
    Processing: Standard Processing (SP)
    Best for: Archived, quality-controlled data (delayed but more accurate).

5. VIIRS_NOAA21_NRT
    Satellite: NOAA-21 (JPSS-2, launched 2023)
    Processing: NRT + URT
    Best for: Newest satellite with the latest sensor tech (similar to NOAA-20 but with potential improvements).

- For real-time monitoring: VIIRS_SNPP_NRT (most widely used) or VIIRS_NOAA20_NRT.
- For US/Canada with fastest updates: URT data in VIIRS_NOAA20_NRT or VIIRS_NOAA21_NRT.
- For research/validation: VIIRS_SNPP_SP or VIIRS_NOAA20_SP (higher quality but delayed).
*/

/**
 * Geocode an address to latitude/longitude using Nominatim API
 * @param {string} address - The address to geocode
 * @returns {Promise<{lat: number, lon: number}>} - The coordinates
 */
async function geocodeAddress(address) {
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
  } catch (error) {
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
async function checkForWildfires(lat, lon) {
  try {
    // Create a bounding box around the point (±0.05 degrees, ~5km radius)
    const boxSize = 0.05;
    const boundingBox = {
      minLat: lat - boxSize,
      maxLat: lat + boxSize,
      minLon: lon - boxSize,
      maxLon: lon + boxSize,
    };

    // Calculate dates
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - DAYS_TO_CHECK);

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
    // console.log("Response Headers:", response.headers);
    // console.log(response.data);

    // Parse CSV response
    const lines = response.data.trim().split("\n");
    const headers = lines[0].split(",");

    // console.log(lines);
    // console.log(headers);

    // Create objects from CSV
    const fireData = lines.slice(1).map((line) => {
      const values = line.split(",");
      const obj = {};
      headers.forEach((header, i) => {
        obj[header.trim()] = values[i];
      });
      return obj;
    });

    return {
      hasWildfire: fireData.length > 0,
      fireData: fireData,
    };
  } catch (error) {
    console.error("Error checking for wildfires:", error.message);
    throw error;
  }
}

/**
 * Main function to process an address and check for wildfires
 * @param {string} address - The address to check
 */
async function checkLocationForWildfires(address) {
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

    // console.log(wildfireData);

    // Step 3: Display results
    if (wildfireData.hasWildfire) {
      console.log(
        `\nWILDFIRE DETECTED! ${wildfireData.fireData.length} fire hotspots found within the last ${DAYS_TO_CHECK} days.`
      );

      // Display the first 5 fire reports
      console.log("\nRecent fire reports:");
      wildfireData.fireData.slice(0, 5).forEach((fire, i) => {
        console.log(`\nFire #${i + 1}:`);
        console.log(`  Date: ${fire.acq_date || "Unknown"}`);
        console.log(`  Time: ${fire.acq_time || "Unknown"}`);
        console.log(`  Confidence: ${fire.confidence || "Unknown"}`);
        console.log(`  Brightness: ${fire.bright_ti4 || "Unknown"}`);
        console.log(`  Location: ${fire.latitude}, ${fire.longitude}`);
      });

      if (wildfireData.fireData.length > 5) {
        console.log(
          `\n...and ${wildfireData.fireData.length - 5} more fire hotspots.`
        );
      }
    } else {
      console.log(
        "\nNo wildfires detected at this location within the last " +
          `${DAYS_TO_CHECK} days.`
      );
    }
  } catch (error) {
    console.error("\nError:", error.message);
    process.exit(1);
  }
}

// Get address from command line argument
const address = process.argv[2];

if (!address) {
  console.error("Please provide an address as a command line argument.");
  console.error('Usage: node index.js "123 Main St, City, State, Zip"');
  process.exit(1);
}

// Run the script
checkLocationForWildfires(address);
