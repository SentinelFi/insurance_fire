"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/use-toast";
import Fireworks from "@/components/Fireworks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, MapPin, FileText, CheckCircle } from "lucide-react";
import { coverageAreas, insuranceData, insuranceEpochs } from "@/lib/data";
import Link from "next/link";
import { useWallet } from "../../context/wallet-context";
import QRCode from "react-qr-code";
import { getProofs, start } from "@/actions/reclaim";
import { FireBastionConfig, fireBastionConfigs } from "@/lib/config";

export default function Insurance() {
  const [epoch, setEpoch] = useState("");
  const [area, setArea] = useState("");
  const [premium, setPremium] = useState(100);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [verificationStep, setVerificationStep] = useState(1);
  const [policyAgreed, setPolicyAgreed] = useState(false);

  const { walletAddress } = useWallet();

  const [requestUrl, setRequestUrl] = useState("");
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [contractConfig, setContractConfig] =
    useState<FireBastionConfig | null>(null);

  useEffect(() => {
    console.log("Epoch ID: ", epoch, " - Area ID: ", area);
    if (!epoch || !area) {
      setContractConfig(null);
      return;
    }
    const insur = fireBastionConfigs.find(
      (val) => val.areaId === area && val.epochId === epoch
    );
    if (insur) {
      setContractConfig(insur);
    } else {
      setContractConfig(null);
    }
  }, [epoch, area]);

  const handleViewMap = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
      title: "Map View",
      description: "Map view feature is coming soon.",
      variant: "default",
    });
  };

  const handleStartPurchase = async () => {
    if (!epoch || !area) {
      toast({
        title: "Missing Information",
        description:
          "Please select both the insurance epoch and coverage area.",
        variant: "destructive",
      });
      return;
    }
    try {
      setLoading(true);
      setProofs([]);
      const requestUrl = await start();
      console.log("Request URL:", requestUrl);
      setRequestUrl(requestUrl);
      setVerificationStep(1);
      setShowVerificationDialog(true);
    } catch (e) {
      console.log("Reclaim error", e);
      toast({
        title: "Reclaim Verification Failed",
        description: "Reclaim error! Check console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLocation = async () => {
    try {
      setLoading(true);
      setProofs([]);
      setVerificationStep(2);
      const latestProofs = await getProofs();
      console.log(latestProofs);
      setProofs(latestProofs);
      if (proofs && proofs.length > 0) {
        console.log("Received proofs");
      } else {
        console.log("Unable to receive proofs");
      }
      setVerificationStep(3);
    } catch (e) {
      console.log("Proofs error", e);
      setProofs([]);
      toast({
        title: "Proofs Verification Failed",
        description: "Proofs error! Check console for details.",
        variant: "destructive",
      });
      setVerificationStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPolicy = () => {
    setShowVerificationDialog(false);
    setShowPolicyDialog(true);
  };

  const handlePurchase = async () => {
    setShowPolicyDialog(false);

    if (!contractConfig) {
      toast({
        title: "Failed",
        description: "Unable to find configured insurance!",
        variant: "destructive",
      });
      return;
    }

    setShowFireworks(true);
    toast({
      title: "Success",
      description: "Insurance purchased successfully!",
      variant: "default",
    });
  };

  return (
    <main className="flex-1 pt-24">
      <div className="container mx-auto px-4 py-12">
        <Fireworks
          show={showFireworks}
          onComplete={() => setShowFireworks(false)}
        />

        <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8">
          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold mb-6">
              Purchase Fire Damage Insurance
            </h1>

            {!walletAddress ? (
              <Card className="mb-8 animate-fade-in">
                <CardHeader>
                  <CardTitle>Connect Your Wallet</CardTitle>
                  <CardDescription>
                    Connect your Stellar wallet to access insurance services
                  </CardDescription>
                </CardHeader>
                <CardFooter></CardFooter>
              </Card>
            ) : (
              <Card className="mb-8 animate-fade-in">
                <CardHeader>
                  <CardTitle>New Insurance Policy</CardTitle>
                  <CardDescription>
                    Customize your insurance parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="epoch">Insurance Epoch</Label>
                    <Select value={epoch} onValueChange={setEpoch}>
                      <SelectTrigger id="epoch">
                        <SelectValue placeholder="Select epoch" />
                      </SelectTrigger>
                      <SelectContent>
                        {insuranceEpochs.map((epochItem) => (
                          <SelectItem key={epochItem.id} value={epochItem.id}>
                            {epochItem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Coverage Area</Label>
                    <Select value={area} onValueChange={setArea}>
                      <SelectTrigger id="area">
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                      <SelectContent>
                        {coverageAreas.map((area) => (
                          <SelectItem key={area.id} value={area.id}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-sm mt-1">
                      <Link
                        href="#"
                        onClick={handleViewMap}
                        className="text-orange-500 hover:underline"
                      >
                        View on map
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="premium">Premium Amount (USDC)</Label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        id="premium"
                        min={10}
                        max={1000}
                        step={10}
                        value={[premium]}
                        onValueChange={(value) => setPremium(value[0])}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={premium}
                        onChange={(e) => setPremium(Number(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Coverage Information</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Available Coverage:</div>
                      <div className="font-medium text-green-600">
                        {area === "area1"
                          ? "5,200"
                          : area === "area2"
                          ? "12,350"
                          : area === "area3"
                          ? "8,500"
                          : area === "area4"
                          ? "7,800"
                          : "0"}{" "}
                        USDC
                      </div>
                      <div>Provided by:</div>
                      <div className="font-medium">
                        {area === "area1"
                          ? "18"
                          : area === "area2"
                          ? "32"
                          : area === "area3"
                          ? "24"
                          : area === "area4"
                          ? "26"
                          : "0"}{" "}
                        providers
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleStartPurchase}
                      disabled={loading}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      {loading ? "Loading..." : "Start Purchase Process"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card
              className="animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <CardHeader>
                <CardTitle>My Insurance Portfolio</CardTitle>
                <CardDescription>
                  View and manage your active insurance policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                {walletAddress ? (
                  <div className="space-y-4">
                    {insuranceData.map((policy) => (
                      <div
                        key={policy.id}
                        className={`border rounded-lg p-4 hover:bg-orange-50 dark:hover:text-black transition duration-200 ${
                          !policy.isActive ? "opacity-70" : ""
                        }`}
                      >
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold">
                            Policy #{policy.id}
                          </span>
                          <span
                            className={
                              policy.isActive
                                ? "text-green-500 font-medium"
                                : "text-gray-500 font-medium"
                            }
                          >
                            {policy.isActive ? "Active" : "Expired"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>Area: {policy.area}</div>
                          <div>Epoch: {policy.epoch}</div>
                          <div>Premium: {policy.premium}</div>
                          <div>Expires: {policy.expires}</div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-gray-600"
                          >
                            Exit Policy
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Connect your wallet to view your insurance policies
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:w-1/3">
            <Card
              className="sticky top-4 animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <CardHeader>
                <CardTitle>Technical Details</CardTitle>
                <CardDescription>Infrastructure information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Smart Contract</h3>
                  {contractConfig?.marketContactAddress ? (
                    <Link
                      href={`https://stellar.expert/explorer/testnet/contract/${contractConfig?.marketContactAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-gray-100 p-2 rounded block break-all hover:bg-gray-200 transition-colors flex items-center justify-between"
                    >
                      <span>{contractConfig?.marketContactAddress}</span>
                      <ExternalLink size={14} className="text-gray-500" />
                    </Link>
                  ) : (
                    <i>Select epoch and area to view</i>
                  )}
                </div>
                <div>
                  <h3 className="font-medium mb-1">Oracle Provider</h3>
                  <p className="text-sm">
                    Acurast TEE (Trusted Execution Environment)
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Fire Data API</h3>
                  <p className="text-sm">
                    FIRMS (Fire Information for Resource Management System)
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Potential ROI</h3>
                  <p className="text-xl font-semibold text-orange-500">
                    8-12% APY
                  </p>
                  <p className="text-xs text-gray-500">
                    For coverage providers, varies based on risk assessment
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog
          open={showVerificationDialog}
          onOpenChange={setShowVerificationDialog}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Property Verification</DialogTitle>
              <DialogDescription>
                We need to verify your property is within our coverage area
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {verificationStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 justify-center align-center">
                    <MapPin className="text-orange-500" size={24} />
                    <div>
                      <h3 className="font-medium">
                        Verify Your Property Location
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        This helps us confirm coverage availability
                      </p>
                    </div>
                  </div>

                  {/* <div className="space-y-2">
                    <Label htmlFor="address">Property Address</Label>
                    <Input id="address" placeholder="Enter your full address" />
                  </div> */}

                  <h3 className="font-medium text-center">
                    Please scan this QR code using your mobile phone, then
                    follow the instructions on your device:
                  </h3>

                  {requestUrl && (
                    <div className="flex flex-col justify-center align-center items-center">
                      <QRCode value={requestUrl} />
                      <Link
                        className="text-blue-500 hover:underline text-center mt-4"
                        href={requestUrl}
                        target="_blank"
                      >
                        {requestUrl}
                      </Link>
                    </div>
                  )}

                  <div className="text-center">
                    <Button
                      onClick={handleVerifyLocation}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      Verify Location
                    </Button>
                  </div>
                </div>
              )}

              {verificationStep === 2 && (
                <div className="text-center py-8">
                  <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Verifying location against coverage areas...</p>
                </div>
              )}

              {verificationStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-green-600">
                    <CheckCircle size={32} />
                    <div>
                      <h3 className="font-medium">Location Verified!</h3>
                      <p className="text-sm text-muted-foreground">
                        Your property is within our coverage area
                      </p>
                    </div>
                  </div>

                  {proofs && (
                    <div className="ml-10">
                      <h2>Verification Proofs:</h2>
                      {/* <pre>{JSON.stringify(proofs, null, 2)}</pre> */}
                      <p>Amazon address is valid!</p>
                    </div>
                  )}

                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm">
                      Property at{" "}
                      <span className="font-medium">your address</span> is
                      eligible for fire damage insurance coverage.
                    </p>
                  </div>

                  <div className="text-center pt-4">
                    <Button
                      onClick={handleProceedToPolicy}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      Proceed to Policy Terms
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showPolicyDialog} onOpenChange={setShowPolicyDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="text-orange-500" size={20} />
                Insurance Policy Agreement
              </DialogTitle>
              <DialogDescription>
                Please review the terms of your insurance policy
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded max-h-60 overflow-y-auto text-sm space-y-3 mb-4">
                <p className="font-medium">
                  Fire Damage Insurance Policy #
                  {Date.now().toString().slice(-8)}
                </p>
                <p>
                  This fire damage insurance policy ("Policy") is a smart
                  contract between the policy holder and FireBastion Insurance
                  on the Stellar Soroban blockchain.
                </p>

                <h4 className="font-medium">1. Coverage</h4>
                <p>
                  This Policy provides coverage for direct physical loss or
                  damage to the insured property caused by fire during the
                  policy period, as verified by Acurast TEE oracle data.
                </p>

                <h4 className="font-medium">2. Policy Period</h4>
                <p>
                  The coverage period is{" "}
                  {insuranceEpochs.find((e) => e.id === epoch)?.name ||
                    "the selected epoch"}
                  .
                </p>

                <h4 className="font-medium">3. Premium</h4>
                <p>
                  The premium for this Policy is {premium} USDC, payable in full
                  upon execution of this smart contract.
                </p>

                <h4 className="font-medium">4. Coverage Area</h4>
                <p>
                  This Policy covers the verified property located in{" "}
                  {coverageAreas.find((a) => a.id === area)?.name ||
                    "the selected area"}
                  .
                </p>

                <h4 className="font-medium">5. Claims</h4>
                <p>
                  Claims are processed automatically when fire incidents within
                  the coverage area are detected and verified by Acurast TEE
                  oracles.
                </p>

                <h4 className="font-medium">6. Calculation of Loss</h4>
                <p>
                  The amount of loss is determined by the percentage of the
                  property affected and the intensity of the fire event, as
                  reported by FIRMS data.
                </p>

                <h4 className="font-medium">7. Exclusions</h4>
                <p>
                  This Policy does not cover loss or damage caused by
                  intentional acts, war, nuclear hazard, or governmental action.
                </p>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="terms"
                  checked={policyAgreed}
                  onCheckedChange={(checked) =>
                    setPolicyAgreed(checked === true)
                  }
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the policy terms and conditions
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPolicyDialog(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={!policyAgreed}
                onClick={handlePurchase}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Sign and Purchase
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
