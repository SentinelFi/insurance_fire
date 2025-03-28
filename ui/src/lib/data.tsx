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
