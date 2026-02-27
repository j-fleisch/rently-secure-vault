import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Star, Award, CheckCircle } from "lucide-react";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import heroImage from "@/assets/hero-illustration.webp";

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
      {/* Split hero — Steadily-inspired */}
      <div className="container py-16 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left — copy */}
          <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight">
              <span className="italic text-accent">Smart</span> insurance{" "}
              <br className="hidden sm:block" />
              for landlords & tenants.
            </h1>

            <p className="text-lg text-muted-foreground max-w-md">
              Get a quote in seconds. Get covered in minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
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

          {/* Right — image */}
          <div className="flex justify-center md:justify-end animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <img
              src={heroImage}
              alt="Modern property protected by Cedar insurance"
              className="w-full max-w-md md:max-w-lg rounded-3xl object-cover"
              loading="eager"
            />
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
