"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import Link from "next/link";
import { start, getProofs } from "../actions/reclaim";

function ReclaimDemo() {
  const [requestUrl, setRequestUrl] = useState("");
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadProofs = async () => {
    try {
      setError("");
      setLoading(true);
      if (!requestUrl) {
        setProofs([]);
        return;
      }
      const latestProofs = await getProofs();
      setProofs(latestProofs);
    } catch (error) {
      console.error("Error fetching proofs:", error);
      setError(error as string);
      setProofs([]);
    } finally {
      setLoading(false);
    }
  };

  const getVerificationReq = async () => {
    try {
      setError("");
      setLoading(true);
      setProofs([]);
      const requestUrl = await start();
      console.log("Request URL:", requestUrl);
      setRequestUrl(requestUrl);
    } catch (e) {
      console.log("Catch error", e);
      alert("Error! Check console for details.");
      setError(e as string);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="font-bold mx-10 mt-10">RECLAIM DEMO</h1>
      <button
        disabled={loading}
        onClick={getVerificationReq}
        className="bg-blue-500 px-4 py-3 rounded text-white m-10 cursor-pointer"
      >
        Get Verification Request
      </button>

      {loading && <p className="mx-10 mb-10">Loading...</p>}

      {error && <p className="mx-10 mb-10 text-red-500">{error}</p>}

      {/* Display QR code when URL is available */}

      {requestUrl && (
        <div style={{ margin: "20px 30px" }}>
          <QRCode value={requestUrl} />
          <br />
          <Link className="text-blue-500" href={requestUrl} target="_blank">
            {requestUrl}
          </Link>
        </div>
      )}

      <br></br>

      <button
        onClick={loadProofs}
        disabled={loading}
        className="bg-green-500 px-4 py-3 rounded text-white m-10 cursor-pointer"
      >
        Load Proofs
      </button>

      {proofs && (
        <div className="ml-10">
          <h2>Verification Proofs:</h2>
          <pre>{JSON.stringify(proofs, null, 2)}</pre>
        </div>
      )}
    </>
  );
}

export default ReclaimDemo;
