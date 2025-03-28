"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
// import MovingBackground from "@/components/MovingBackground";
import { ArrowRight, Globe, Flame, Clock, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { features, headlines, stats, steps, testimonials } from "@/lib/data";

const Landing = () => {
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const [isStatsVisible, setIsStatsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % headlines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsStatsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute top-20 -left-20 w-64 h-64 rounded-full bg-flame-100/30 dark:bg-flame-900/20 filter blur-3xl animate-blob"></div>
        <div className="absolute -bottom-32 -right-20 w-80 h-80 rounded-full bg-flame-50/40 dark:bg-flame-800/10 filter blur-3xl animate-blob-slow"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center max-w-6xl mx-auto">
            <div className="md:w-1/2 mb-12 md:mb-0">
              <div className="h-24 md:h-32 overflow-hidden mb-2">
                {headlines.map((headline, index) => (
                  <h1
                    key={index}
                    className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 absolute transition-all duration-1000 ${
                      index === headlineIndex
                        ? "opacity-100 transform translate-y-0"
                        : "opacity-0 transform -translate-y-8"
                    }`}
                  >
                    <span className="gradient-heading">{headline}</span>
                  </h1>
                ))}
              </div>
              <p
                className="text-lg text-muted-foreground mb-8 max-w-lg"
                style={{ animationDelay: "0.2s" }}
              >
                Fully autonomous, on-chain solution powered by Stellar Soroban
                Blockchain. Protect your property with transparent and efficient
                insurance coverage.
              </p>
              <div
                className="flex flex-col sm:flex-row gap-4"
                style={{ animationDelay: "0.4s" }}
              >
                <Button
                  asChild
                  className="bg-flame-500 hover:bg-flame-600 text-white w-full sm:w-auto group"
                >
                  <Link
                    href="/insurance"
                    className="flex items-center justify-center"
                  >
                    Get Insurance
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-flame-500 text-flame-500 hover:bg-flame-50 w-full sm:w-auto"
                >
                  <Link
                    href="/counterparty"
                    className="flex items-center justify-center dark:hover:bg-gray-700"
                  >
                    Provide Coverage
                  </Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-flame-500 to-flame-600 rounded-2xl blur opacity-40 dark:opacity-30 animate-pulse-subtle"></div>
                <div className="glass-card border rounded-2xl shadow-xl overflow-hidden p-8 relative">
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-flame-500 text-white p-2 rounded-full">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          Smart Contract Protected
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Guaranteed payouts, automated claims
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={statsRef}
        className="py-16 glass-card border-y relative overflow-hidden"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center transition-all duration-700 ${
                  isStatsVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl md:text-4xl font-display font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl gradient-heading mb-4 py-4">
              Why Choose Our Solution
            </h2>
            <p className="text-muted-foreground">
              Our decentralized insurance platform offers transparent,
              efficient, and secure coverage for your property.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="overflow-hidden transition-all duration-300 hover:shadow-lg border hover:border-flame-200 dark:hover:border-flame-800"
              >
                <CardContent className="p-6">
                  <div className="bg-flame-100 dark:bg-flame-900/40 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-flame-500">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 glass-card border-y relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl gradient-heading mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Get insured in three simple steps with our streamlined process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[calc(100%_-_16px)] w-full h-0.5 bg-flame-100 dark:bg-flame-900/40 z-0"></div>
                )}
                <div className="glass-card border hover:border-flame-200 dark:hover:border-flame-800 rounded-xl p-6 relative z-10 h-full transition-all duration-300 hover:shadow-lg">
                  <div className="bg-flame-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-medium mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden">
        <div className="absolute top-20 right-0 w-64 h-64 rounded-full bg-flame-100/30 dark:bg-flame-900/20 filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-flame-50/30 dark:bg-flame-800/10 filter blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl gradient-heading mb-4">
              What Our Users Say
            </h2>
            <p className="text-muted-foreground">
              Join thousands of satisfied users who trust FireBastion for their
              insurance needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="glass-card border hover:border-flame-200 dark:hover:border-flame-800 transition-all duration-300 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center mt-4">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-10 h-10 rounded-full bg-flame-100 dark:bg-flame-800 flex items-center justify-center text-flame-500 dark:text-flame-300 font-medium">
                        {testimonial.name.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden bg-flame-500 dark:bg-flame-600 text-white">
        <div className="absolute -left-24 top-10 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -right-24 bottom-10 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Ready to Get Protected?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Connect your wallet and start your decentralized insurance journey
            today!
          </p>
          <div className="flex justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-flame-500 hover:bg-white/90 group"
            >
              <Link
                href="/insurance"
                className="flex items-center justify-center"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
