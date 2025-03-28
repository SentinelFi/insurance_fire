"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  HelpCircle,
  ArrowRight,
  FireExtinguisher,
  Home,
  AlertTriangle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/lib/data";

export default function Assistance() {
  const submitContactForm = () => {
    console.log("Pressed submit contact form");
    alert("Demo!");
  };

  return (
    <main className="flex-1 pt-24">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold gradient-heading mb-4 py-4">
            Fire Safety & Assistance
          </h1>
          <p className="text-muted-foreground text-lg">
            Learn how to protect your property and prepare for emergencies with
            these essential fire safety tips.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="glass-card border hover:border-flame-200 dark:hover:border-flame-800 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="bg-flame-100 dark:bg-flame-900/40 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-flame-500">
                <FireExtinguisher size={24} />
              </div>
              <CardTitle>Prevention Tips</CardTitle>
              <CardDescription>
                Protect your property from fire risks
              </CardDescription>
            </CardHeader>
            <CardContent className="text-left">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="inside">
                  <AccordionTrigger>Inside Your Home</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Install smoke alarms on every level of your home</li>
                      <li>
                        Test smoke alarms monthly and replace batteries annually
                      </li>
                      <li>
                        Keep flammable items at least 3 feet from heat sources
                      </li>
                      <li>Never leave cooking unattended</li>
                      <li>Avoid overloading electrical outlets</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="outside">
                  <AccordionTrigger>Outside Your Home</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Clear dry leaves and debris from gutters and roof</li>
                      <li>
                        Remove dead vegetation within 30 feet of your home
                      </li>
                      <li>
                        Store firewood at least 30 feet away from structures
                      </li>
                      <li>Create firebreaks around your property</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  window.open(
                    "https://www.ready.gov/home-fires",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                Learn More
              </Button>
            </CardFooter>
          </Card>

          <Card className="glass-card border hover:border-flame-200 dark:hover:border-flame-800 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="bg-flame-100 dark:bg-flame-900/40 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-flame-500">
                <AlertTriangle size={24} />
              </div>
              <CardTitle>Emergency Preparedness</CardTitle>
              <CardDescription>
                Be ready when emergencies strike
              </CardDescription>
            </CardHeader>
            <CardContent className="text-left">
              <h4 className="font-medium mb-2">Emergency Kit Essentials</h4>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Water (1 gallon per person per day)</li>
                <li>Non-perishable food (3-day supply)</li>
                <li>Battery-powered radio</li>
                <li>Flashlight and extra batteries</li>
                <li>First aid kit</li>
                <li>Whistle to signal for help</li>
                <li>Dust mask</li>
                <li>Moist towelettes, garbage bags</li>
                <li>Local maps</li>
                <li>Cell phone with chargers</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  window.open(
                    "https://www.ready.gov/kit",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                Read More
              </Button>
            </CardFooter>
          </Card>

          <Card className="glass-card border hover:border-flame-200 dark:hover:border-flame-800 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="bg-flame-100 dark:bg-flame-900/40 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-flame-500">
                <Home size={24} />
              </div>
              <CardTitle>Evacuation Plan</CardTitle>
              <CardDescription>
                Know what to do when time matters
              </CardDescription>
            </CardHeader>
            <CardContent className="text-left">
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Identify multiple evacuation routes from your home and
                  neighborhood
                </li>
                <li>Designate meeting locations for family members</li>
                <li>
                  Pack essential documents in a fireproof box or cloud storage
                </li>
                <li>Plan for pets and livestock</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  window.open(
                    "https://www.ready.gov/evacuation",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                Plan Now
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="max-w-3xl mx-auto glass-card border rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-flame-500 text-white p-2 rounded-full">
              <HelpCircle size={20} />
            </div>
            <h2 className="text-2xl font-semibold">Contact Form</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <Input id="name" placeholder="Enter your full name" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <Input id="phone" placeholder="Enter your phone number" />
            </div>
            <div>
              <label
                htmlFor="wallet"
                className="block text-sm font-medium mb-2"
              >
                Wallet Address (Optional)
              </label>
              <Input
                id="wallet"
                placeholder="Enter your public wallet address"
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              How can we help you?
            </label>
            <Textarea
              id="message"
              rows={5}
              placeholder="Describe your issue or question"
            />
          </div>

          <Button
            className="bg-flame-500 hover:bg-flame-600 text-white w-full sm:w-auto"
            onClick={submitContactForm}
          >
            <span>Submit Request</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold mb-4" id="faq">
            Frequently Asked Questions
          </h3>
          <div className="max-w-3xl mx-auto grid gap-6">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="glass-card border rounded-lg p-6 text-left"
              >
                <h4 className="text-lg font-medium mb-2">{faq.question}</h4>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
