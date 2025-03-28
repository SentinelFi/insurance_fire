"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

interface WalletContextType {
  walletAddress: string | null;
  setWalletAddress: (address: string | null) => void;
}

const WalletContext = createContext<WalletContextType>({
  walletAddress: null,
  setWalletAddress: () => {},
});

export const WalletProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  return (
    <WalletContext.Provider value={{ walletAddress, setWalletAddress }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
