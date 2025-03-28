"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { Menu, Moon, ShieldCheck, SunMoon, X } from "lucide-react";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { navLinks } from "@/lib/data";
import { usePathname } from "next/navigation";
import {
  setAllowed,
  getAddress,
  isConnected,
  requestAccess,
} from "@stellar/freighter-api";
import { toast } from "@/components/ui/use-toast";
import { useWallet } from "../context/wallet-context";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const { walletAddress, setWalletAddress } = useWallet();

  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const checkFreighter = async () => {
    try {
      const connected = await isConnected();
      if (!connected) throw "Freigher connection returned empty response";
      if (connected.error)
        throw `Freighter connection error: ${connected.error}`;
      if (connected.isConnected) {
        console.log("Is wallet connected.");
        const pubKey = await getAddress();
        if (!pubKey)
          throw "Freigher address returned empty response for public key";
        if (pubKey.error) throw `Freighter address error: ${pubKey.error}`;
        console.log("Freighter wallet address:", pubKey.address);
        // setWalletAddress(pubKey.address); // If auto connect is needed
      } else {
        console.log("Freighter wallet extension is not enabled!");
        toast({
          title: "Freighter Wallet Extension",
          description: "Freighter wallet extension is not enabled!",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.log("Error checking Freighter connection:", error);
      toast({
        title: "Freighter Wallet Extension",
        description:
          "Freighter wallet extension error. Please check the console for details.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkFreighter();
  }, []);

  const handleConnectWallet = async () => {
    try {
      if (walletAddress) {
        // Disconnect if connected
        setWalletAddress(null);
        return;
      }
      await checkFreighter();
      const isAllowed = await setAllowed();
      if (!isAllowed) throw "Freigher returned empty allowed response";
      if (isAllowed.error) throw `Freighter allowed error: ${isAllowed.error}`;
      else
        console.log(
          "Successfully added the app to Freighter's Allow List " +
            isAllowed.isAllowed
        );
      const pubKey = await getAddress();
      if (!pubKey) throw "Freigher address returned empty response";
      if (pubKey.error) throw `Freighter address error: ${pubKey.error}`;
      console.log(pubKey);
      setWalletAddress(pubKey.address);
      if (!pubKey.address) {
        const accessObj = await requestAccess();
        if (accessObj.error) throw `Freighter access error: ${accessObj.error}`;
        else {
          console.log(accessObj);
          const pubKey = await getAddress();
          if (!pubKey.error) {
            console.log("Get Address:", pubKey.address);
            setWalletAddress(pubKey.address);
          }
        }
      }
    } catch (error) {
      console.log("Error connecting to Freighter:", error);
      toast({
        title: "Freighter Connection",
        description:
          "Error connecting wallet. Please check the console for details.",
        variant: "destructive",
      });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "py-2 glass-card border-b shadow-sm"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center transition-transform duration-300 hover:scale-105">
            <Link
              href="/"
              className="font-display font-semibold text-xl gradient-text flex items-center gap-2"
            >
              <Logo size={32} />
              <span className="transition-colors duration-300">
                FireBastion
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex mx-auto space-x-6 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`nav-link ${
                  pathname === link.path
                    ? "text-flame-500 active"
                    : "text-foreground/80 hover:text-flame-500"
                }`}
              >
                {link.title}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-full"
            >
              {isDarkMode ? <SunMoon size={18} /> : <Moon size={18} />}
            </Button>

            <Button
              onClick={handleConnectWallet}
              variant={walletAddress ? "outline" : "default"}
              className={`transition-all duration-300 hover:scale-105 transform ${
                walletAddress
                  ? "border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-gray-600"
                  : "bg-flame-500 hover:bg-flame-600 dark:hover:bg-gray-600 text-white"
              }`}
            >
              {walletAddress ? (
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-xs font-medium">{`${walletAddress.substring(
                    0,
                    4
                  )}...${walletAddress.substring(
                    walletAddress.length - 4
                  )}`}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} />
                  <span>Connect Wallet</span>
                </div>
              )}
            </Button>
          </div>

          <div className="flex md:hidden items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-full"
            >
              {isDarkMode ? <SunMoon size={18} /> : <Moon size={18} />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-full"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden glass-card border-t animate-fade-in">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-3 py-2 rounded-md text-base font-medium ${
                    pathname === link.path
                      ? "bg-flame-50 text-flame-600"
                      : "text-foreground hover:bg-secondary hover:text-flame-500"
                  }`}
                >
                  {link.title}
                </Link>
              ))}
              <div className="pt-2 border-t border-border/50">
                <Button
                  onClick={handleConnectWallet}
                  className="w-full justify-between bg-flame-500 hover:bg-flame-600 text-white"
                >
                  {walletAddress ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs">{`${walletAddress.substring(
                        0,
                        6
                      )}...${walletAddress.substring(
                        walletAddress.length - 4
                      )}`}</span>
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span>Connect Wallet</span>
                      <ShieldCheck size={16} />
                    </div>
                  )}
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
