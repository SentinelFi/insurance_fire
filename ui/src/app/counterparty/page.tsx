"use client";

import React, { useState } from "react";
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
import Link from "next/link";
import { counterpartyData, coverageAreas, insuranceEpochs } from "@/lib/data";

export default function Counterparty() {
  const [epoch, setEpoch] = useState("");
  const [area, setArea] = useState("");
  const [coverageAmount, setCoverageAmount] = useState(1000);
  const [walletConnected, setWalletConnected] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  const contractAddress = "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

  const handleConnectWallet = () => {
    setWalletConnected(true);
    toast({
      title: "Wallet Connected",
      description: "Your Stellar wallet has been connected successfully.",
    });
  };

  const handleViewMap = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
      title: "Map View",
      description: "Risk assessment map view feature is coming soon.",
      variant: "default",
    });
  };

  const handleProvideCoverage = () => {
    setShowFireworks(true);
    toast({
      title: "Success",
      description: "Coverage provided successfully!",
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
              Provide Fire Damage Coverage
            </h1>

            {!walletConnected ? (
              <Card className="mb-8 animate-fade-in">
                <CardHeader>
                  <CardTitle>Connect Your Wallet</CardTitle>
                  <CardDescription>
                    Connect your Stellar wallet to provide coverage
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button
                    onClick={handleConnectWallet}
                    className="bg-orange-500 hover:bg-orange-600 dark:hover:bg-gray-600"
                  >
                    Connect Wallet
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="mb-8 animate-fade-in">
                <CardHeader>
                  <CardTitle>New Coverage</CardTitle>
                  <CardDescription>
                    Set parameters for the coverage you want to provide
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="epoch">Coverage Epoch</Label>
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
                    <Label htmlFor="coverage">Coverage Amount (USDC)</Label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        id="coverage"
                        min={100}
                        max={10000}
                        step={100}
                        value={[coverageAmount]}
                        onValueChange={(value) => setCoverageAmount(value[0])}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={coverageAmount}
                        onChange={(e) =>
                          setCoverageAmount(Number(e.target.value))
                        }
                        className="w-24"
                      />
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Market Information</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Current Premiums:</div>
                      <div className="font-medium text-orange-500">
                        {area === "area1"
                          ? "2,450"
                          : area === "area2"
                          ? "5,675"
                          : area === "area3"
                          ? "3,280"
                          : area === "area4"
                          ? "4,120"
                          : "0"}{" "}
                        USDC
                      </div>
                      <div>Active Policies:</div>
                      <div className="font-medium">
                        {area === "area1"
                          ? "12"
                          : area === "area2"
                          ? "22"
                          : area === "area3"
                          ? "15"
                          : area === "area4"
                          ? "18"
                          : "0"}{" "}
                        policies
                      </div>
                      <div>Estimated APY:</div>
                      <div className="font-medium text-orange-500">
                        {area === "area1"
                          ? "10.2%"
                          : area === "area2"
                          ? "8.5%"
                          : area === "area3"
                          ? "11.5%"
                          : area === "area4"
                          ? "9.8%"
                          : "8-12%"}
                      </div>
                      <div>Risk Score:</div>
                      <div className="font-medium">
                        {area === "area1"
                          ? "Medium (65/100)"
                          : area === "area2"
                          ? "High (82/100)"
                          : area === "area3"
                          ? "Low (35/100)"
                          : area === "area4"
                          ? "Medium-High (75/100)"
                          : "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleProvideCoverage}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      Provide Coverage
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
                <CardTitle>My Coverage Portfolio</CardTitle>
                <CardDescription>
                  View and manage your active coverage provisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {walletConnected ? (
                  <div className="space-y-4">
                    {counterpartyData.map((policy) => (
                      <div
                        key={policy.id}
                        className={`border rounded-lg p-4 hover:bg-orange-50 dark:hover:bg-brown-600 dark:hover:text-black transition duration-200 ${
                          !policy.isActive ? "opacity-70" : ""
                        }`}
                      >
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold">
                            Coverage #{policy.id}
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
                          <div>Amount: {policy.amount}</div>
                          <div>Expires: {policy.expires}</div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-gray-600"
                            disabled={!policy.isActive}
                          >
                            Exit Coverage
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Connect your wallet to view your coverage provisions
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
                <CardTitle>Risk Analysis</CardTitle>
                <CardDescription>
                  Technical information about risks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Risk Calculation</h3>
                  <p className="text-sm">
                    Our risk scores are calculated based on:
                  </p>
                  <ul className="text-sm list-disc list-inside mt-1 space-y-1">
                    <li>Historical fire data (2 years)</li>
                    <li>Climate conditions</li>
                    <li>Vegetation density</li>
                    <li>Local fire response infrastructure</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Data Sources</h3>
                  <p className="text-sm">FIRMS API + Acurast Oracle</p>
                  <p className="text-xs text-gray-500 mt-1">
                    All data verified by Acurast's TEE for reliability
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Smart Contract Address</h3>
                  <a
                    href={`https://stellar.expert/explorer/public/contract/${contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-gray-100 p-2 rounded block break-all hover:bg-gray-200 transition-colors"
                  >
                    {contractAddress}
                  </a>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <h3 className="font-medium mb-1">Risk vs Reward</h3>
                  <p className="text-xs">
                    Higher risk areas offer greater rewards but increased
                    likelihood of payouts. Diversification across multiple areas
                    is recommended.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
