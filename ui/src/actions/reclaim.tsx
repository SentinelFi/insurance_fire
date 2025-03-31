"use server";

import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";

let proofsCache: any[] = [];

export async function start(): Promise<string> {
  const APP_ID = process.env.RECLAIM_APP_ID as string;
  const APP_SECRET = process.env.RECLAIM_APP_SECRET as string;
  const PROVIDER_ID = "87677700-a5b4-4497-bb91-1be29192c7e8"; // Amazon provider (https://dev.reclaimprotocol.org/my-applications)

  const reclaimProofRequest = await ReclaimProofRequest.init(
    APP_ID,
    APP_SECRET,
    PROVIDER_ID
  );

  const requestUrl = await reclaimProofRequest.getRequestUrl();

  console.log("Request URL:", requestUrl);

  // Start listening for proof submissions
  await reclaimProofRequest.startSession({
    onSuccess: (proofs: any) => {
      console.log("Verification success", proofs);
      proofsCache = proofs;
    },
    onError: (error) => {
      console.error("Verification failed", error);
    },
  });

  return requestUrl;
}

export async function getProofs(): Promise<any[]> {
  return [];
}
