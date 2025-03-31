/**
 * Liquidation Bot Cron Job
 * 
 * This script sets up a cron job to call the marketBump function on a Soroban contract
 * every 5 minutes to perform liquidation checks or other market operations.
 */

import cron from 'node-cron';
import { callMarketBump } from './soroban.js';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

/**
 * Call the marketBump function on the Soroban contract and handle any errors
 */
async function executeMarketBump() {
  try {
    console.log(`\n[${new Date().toISOString()}] Running scheduled market bump operation`);
    
    // Call the marketBump function from soroban.js
    await callMarketBump();
    
    console.log(`[${new Date().toISOString()}] Completed scheduled market bump operation\n`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error during market bump operation:`, error.message);
  }
}

// Schedule cron job to run every 5 minutes
// Cron format: minute hour day-of-month month day-of-week
cron.schedule('*/5 * * * *', executeMarketBump);

console.log(`Liquidation bot started at ${new Date().toISOString()}`);
console.log(`Market bump operations will run every 5 minutes`);

// Run an initial market bump operation immediately
executeMarketBump();
