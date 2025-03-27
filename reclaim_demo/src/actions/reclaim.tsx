"use server";

import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";

let proofsCache: any[] = [];

export async function start(): Promise<string> {
  // Your credentials from the Reclaim Developer Portal

  const APP_ID = process.env.APP_ID as string;
  const APP_SECRET = process.env.APP_SECRET as string;
  const PROVIDER_ID = "87677700-a5b4-4497-bb91-1be29192c7e8"; // Amazon provider (https://dev.reclaimprotocol.org/my-applications)

  // Initialize the Reclaim SDK with your credentials
  const reclaimProofRequest = await ReclaimProofRequest.init(
    APP_ID,
    APP_SECRET,
    PROVIDER_ID
  );

  // Generate the verification request URL
  const requestUrl = await reclaimProofRequest.getRequestUrl();

  console.log("Request URL:", requestUrl);

  //setRequestUrl(requestUrl);

  // Start listening for proof submissions
  await reclaimProofRequest.startSession({
    // Called when the user successfully completes the verification
    onSuccess: (proofs: any) => {
      console.log("Verification success", proofs);
      proofsCache = proofs;

      // Add your success logic here, such as:
      // - Updating UI to show verification success
      // - Storing verification status
      // - Redirecting to another page
    },
    // Called if there's an error during verification
    onError: (error) => {
      console.error("Verification failed", error);

      // Add your error handling logic here, such as:
      // - Showing error message to user
      // - Resetting verification state
      // - Offering retry options
    },
  });

  return requestUrl;
}

export async function getProofs(): Promise<any[]> {
  return proofsCache;
}
