import { Clock, Flame, Globe } from "lucide-react";

export const headlines = [
  "Decentralized Fire Damage Insurance",
  "Protect Your Property On-Chain",
  "Transparent Coverage via Soroban",
  "Smart Contract Powered Protection",
];

export const features = [
  {
    icon: <Globe size={24} />,
    title: "Fully Decentralized",
    description:
      "All insurance policies are stored on the Stellar Soroban Blockchain, ensuring transparency and immutability.",
  },
  {
    icon: <Clock size={24} />,
    title: "Instant Coverage",
    description:
      "Get insured in minutes with our streamlined process and smart contract automation.",
  },
  {
    icon: <Flame size={24} />,
    title: "Risk Assessment",
    description:
      "Advanced risk scoring using reliable oracle data to determine optimal insurance terms.",
  },
];

export const steps = [
  {
    title: "Connect Wallet",
    description:
      "Connect your Stellar wallet to access our decentralized insurance platform securely.",
  },
  {
    title: "Choose Coverage",
    description:
      "Select your coverage area, epoch, and amount based on your needs.",
  },
  {
    title: "Get Protected",
    description:
      "Confirm your transaction and get instant protection against fire damage.",
  },
];

export const testimonials = [
  {
    name: "Alex Thompson",
    location: "Los Angeles, CA",
    quote:
      "The claim process was incredibly smooth. After the fire, I received my payout within 24 hours with no paperwork hassle.",
  },
  {
    name: "Sarah Johnson",
    location: "Chicago, IL",
    quote:
      "I love the transparency of seeing exactly how my premium is being used and knowing the smart contract guarantees my coverage.",
  },
  {
    name: "Michael Chen",
    location: "Seattle, WA",
    quote:
      "As someone who values innovation, I appreciate how this has revolutionized insurance with blockchain technology.",
  },
];

export const stats = [
  { value: "$2.4M+", label: "Value Insured" },
  { value: "3,500+", label: "Properties Protected" },
  { value: "99.8%", label: "Claims Fulfilled" },
  { value: "<24hrs", label: "Average Claim Time" },
];

export const navLinks = [
  { title: "Home", path: "/" },
  { title: "Insurance", path: "/insurance" },
  { title: "Counterparty", path: "/counterparty" },
  { title: "Assistance", path: "/assistance" },
];

export const faqs = [
  {
    question: "How quickly are claims processed?",
    answer:
      "Our smart contract processes claims automatically as fast as possible with the verification through our oracle solution.",
  },
  {
    question: "What information do I need to file a claim?",
    answer:
      "You'll need to connect your wallet, and if eligible, you will be able to claim the payout.",
  },
  {
    question: "Can I increase my coverage amount after purchasing a policy?",
    answer:
      "Yes, you can modify your coverage by updating your policy through the page. New terms will apply immediately.",
  },
  {
    question: "How are maximum amounts calculated?",
    answer:
      "Maximum amounts are calculated based on location risk assessment and coverage amount.",
  },
];

// For testing
// export const counterpartyData = [
//   {
//     id: 1,
//     area: "Los Angeles County",
//     epoch: "Jun 1 - Aug 31, 2025",
//     amount: "2500 USDC",
//     expires: "Aug 31, 2025",
//     isActive: true,
//   },
//   {
//     id: 2,
//     area: "New York Metropolitan",
//     epoch: "May 1 - May 31, 2024",
//     amount: "800 USDC",
//     expires: "May 31, 2024",
//     isActive: false,
//   },
//   {
//     id: 3,
//     area: "San Francisco Bay Area",
//     epoch: "Mar 1, 2025 - Mar 1, 2026",
//     amount: "5000 USDC",
//     expires: "Mar 1, 2026",
//     isActive: true,
//   },
//   {
//     id: 4,
//     area: "King County",
//     epoch: "Jan 1 - Mar 31, 2024",
//     amount: "1200 USDC",
//     expires: "Mar 31, 2024",
//     isActive: false,
//   },
// ];

export const coverageAreas = [
  {
    id: "area1",
    name: "San Francisco Bay Area",
    latitude: 37.7749,
    longitude: -122.4194,
  },
];

export const insuranceEpochs = [
  { id: "epoch1", name: "March 30, 2025 - April 30, 2025" },
  { id: "epoch2", name: "May 1, 2025 - May 31, 2025" },
];

// For testing
// export const insuranceData = [
//   {
//     id: 1,
//     area: "San Francisco Bay Area",
//     epoch: "Jun 1 - Aug 31, 2025",
//     premium: "250 USDC",
//     expires: "Aug 31, 2025",
//     isActive: true,
//   },
//   {
//     id: 2,
//     area: "King County",
//     epoch: "Mar 1, 2025 - Mar 1, 2026",
//     premium: "500 USDC",
//     expires: "Mar 1, 2026",
//     isActive: true,
//   },
//   {
//     id: 3,
//     area: "New York Metropolitan",
//     epoch: "Jan 1 - Feb 28, 2024",
//     premium: "180 USDC",
//     expires: "Feb 28, 2024",
//     isActive: false,
//   },
// ];

export type InsurancePolicy = {
  id: string;
  isActive: boolean;
  area: string;
  epoch: string;
  amount: number;
  expires: string;
  vaultAddress: string;
};

export interface Wildfire {
  latitude: number;
  longitude: number;
  brightness: number;
  acq_date: string;
  acq_time: string;
  confidence: number;
}
