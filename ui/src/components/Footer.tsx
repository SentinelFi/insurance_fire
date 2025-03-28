"use client";

import { Github, Twitter, Youtube } from "lucide-react";
import Logo from "./Logo";
import { navLinks } from "@/lib/data";
import Link from "next/link";

export default function Footer() {
  const ADDRESS = "GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

  return (
    <footer className="glass-card border-t mt-10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <div className="flex items-center gap-2 mb-6">
              <Logo size={40} />
              <h3 className="gradient-heading text-xl">FireBastion</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Decentralized fire damage insurance on the Stellar Soroban
              blockchain with transparent, automated claims processing.
            </p>
            <div className="flex space-x-4 text-muted-foreground">
              <a
                target="_blank"
                href="https://x.com/"
                className="hover:text-flame-500 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                target="_blank"
                href="https://github.com/"
                className="hover:text-flame-500 transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                target="_blank"
                href="https://www.youtube.com/"
                className="hover:text-flame-500 transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-medium text-base mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="text-sm text-muted-foreground hover:text-flame-500 transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="font-medium text-base mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-flame-500 transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-flame-500 transition-colors"
                >
                  Risk Assessment Guide
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-flame-500 transition-colors"
                >
                  Stellar Soroban
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-flame-500 transition-colors"
                >
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="font-medium text-base mb-4">Smart Contract</h3>
            <div className="p-3 bg-secondary/50 rounded-lg text-xs font-mono text-muted-foreground break-all mb-3">
              {ADDRESS}
            </div>
            <div className="flex items-center">
              <span className="flex items-center text-xs">
                <img src="/stellar.jpg" className="w-8 h-8 mr-2" />
                Built on Stellar Soroban
              </span>
            </div>
          </div>
        </div>
        <div className="border-t mt-10 pt-6 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} FireBastion Insurance. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
