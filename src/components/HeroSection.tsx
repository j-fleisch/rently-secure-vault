import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Star, Award, CheckCircle } from "lucide-react";
import AddressAutocomplete from "@/components/AddressAutocomplete";

const CedarIcon = () => (
  <div className="mx-auto flex flex-col items-center gap-3">
    {/* Three cedar dashes — bold, minimal, Thimble-style */}
    <div className="w-12 md:w-16 h-1 rounded-full bg-accent" />
    <div className="w-24 md:w-32 h-1.5 rounded-full bg-accent" />
    <div className="w-40 md:w-52 h-2 rounded-full bg-accent" />
    {/* Trunk */}
    <div className="w-1.5 h-10 md:h-14 rounded-full bg-accent" />
  </div>
);

const trustBadges = [
  { icon: Shield, label: "FSRA Regulated" },
  { icon: Star, label: "4.8/5 Customer Rating" },
  { icon: Award, label: "A-Rated Underwriters" },
  { icon: CheckCircle, label: "Instant Cover Available" },
];

const HeroSection = () => {
  const [selectedAddress, setSelectedAddress] = useState("");
  const navigate = useNavigate();

  const handleGetQuote = () => {
    const params = selectedAddress
      ? `?address=${encodeURIComponent(selectedAddress)}`
      : "";
    navigate(`/quote${params}`);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Centered hero — Thimble-inspired */}
      <div className="container py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in-up">
          <CedarIcon />

          <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight">
            <span className="italic text-accent">Smart</span> insurance{" "}
            <br className="hidden sm:block" />
            for landlords & tenants.
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Get a quote in seconds. Get covered in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <AddressAutocomplete
              onSelect={(address) => setSelectedAddress(address)}
            />
            <Button
              variant="hero"
              className="h-12 px-8 gap-2"
              onClick={handleGetQuote}
            >
              Get a Quote <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Trust badge bar — Thimble-inspired */}
      <div className="border-t border-border bg-card/60">
        <div className="container py-5">
          <div className="flex flex-wrap justify-center gap-8 md:gap-14">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-muted-foreground">
                <badge.icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
