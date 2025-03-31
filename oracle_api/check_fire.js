/**
 * Wildfire Monitoring Cron Job
 * 
 * This script sets up a cron job to check for wildfires at specified locations
 * every 5 minutes using the NASA FIRMS API.
 */

import cron from 'node-cron';
import { checkLocationForWildfires } from './index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to the config file with addresses to monitor
const CONFIG_FILE = path.join(__dirname, 'monitored_locations.json');

/**
 * Load monitored locations from config file
 * @returns {Array<string>} Array of addresses to monitor
 */
function loadMonitoredLocations() {
  try {
    // Create default config if it doesn't exist
    if (!fs.existsSync(CONFIG_FILE)) {
      const defaultLocations = [
        "501 Stanyan Street, San Francisco, CA 94117" // Golden Gate Park
      ];
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultLocations, null, 2));
      console.log(`Created default config file at ${CONFIG_FILE}`);
    }
    
    // Read and parse the config file
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading monitored locations:', error.message);
    return [];
  }
}

/**
 * Check all monitored locations for wildfires
 */
async function checkAllLocations() {
  const locations = loadMonitoredLocations();
  
  console.log(`\n[${new Date().toISOString()}] Running scheduled wildfire check for ${locations.length} locations`);
  
  for (const address of locations) {
    try {
      await checkLocationForWildfires(address);
      // Add a small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error checking location "${address}":`, error.message);
    }
  }
  
  console.log(`[${new Date().toISOString()}] Completed scheduled wildfire check\n`);
}

// Schedule cron job to run every 5 minutes
// Cron format: minute hour day-of-month month day-of-week
cron.schedule('*/5 * * * *', checkAllLocations);

console.log(`Wildfire monitoring cron job started at ${new Date().toISOString()}`);
console.log(`Monitoring addresses from: ${CONFIG_FILE}`);
console.log(`Checks will run every 5 minutes.`);

// Run an initial check immediately
checkAllLocations(); 