import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Star, Award, CheckCircle } from "lucide-react";
import AddressAutocomplete from "@/components/AddressAutocomplete";

const CedarIcon = () => (
  <svg
    viewBox="0 0 80 100"
    className="w-16 h-20 md:w-20 md:h-24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Three horizontal dashes — narrowest at top, widest at bottom */}
    <rect x="30" y="12" width="20" height="3" rx="1.5" className="fill-accent" />
    <rect x="20" y="28" width="40" height="3.5" rx="1.75" className="fill-accent" />
    <rect x="8"  y="44" width="64" height="4" rx="2" className="fill-accent" />
    {/* Vertical trunk */}
    <rect x="37" y="54" width="6" height="34" rx="3" className="fill-accent" />
  </svg>
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
