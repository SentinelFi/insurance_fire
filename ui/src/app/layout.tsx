import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Fire Bastion",
  description: "Fire Bastion Insurance On Soroban",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Toaster />
        <Sonner />
        <div className={`flex flex-col min-h-screen`}>
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
