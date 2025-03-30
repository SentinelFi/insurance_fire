"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";
import { useWallet } from "../context/wallet-context";
import { fetchUsdcBalance } from "@/actions/server";

interface WalletBalanceProps {
  className?: string;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ className }) => {
  const [balance, setBalance] = useState<number>(0);

  const { walletAddress } = useWallet();

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        if (isMounted) {
          if (walletAddress) {
            const usdc = await fetchUsdcBalance(walletAddress);
            const usdcBalance = usdc ? Number(usdc) : 0;
            setBalance(usdcBalance);
          } else {
            setBalance(0);
          }
        }
      } catch (error) {
        console.log("Error loading USDC balance.", error);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [walletAddress]);

  return (
    <Badge
      variant="outline"
      title="Your wallet balance of USDC asset"
      className={`flex items-center gap-1.5 px-3 py-1.5 ${className}`}
    >
      <Coins size={16} className="text-green-500" />
      <span className="font-medium">
        {balance.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}{" "}
        USDC
      </span>
    </Badge>
  );
};

export default WalletBalance;
