import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, Shield, Star, Award, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-illustration.webp";

const trustBadges = [
  { icon: Shield, label: "FSRA Regulated" },
  { icon: Star, label: "4.8/5 Customer Rating" },
  { icon: Award, label: "A-Rated Underwriters" },
  { icon: CheckCircle, label: "Instant Cover Available" },
];

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Centered hero — Thimble-inspired */}
      <div className="container py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in-up">
          <img
            src={heroImage}
            alt="Property protected by insurance shield"
            className="mx-auto w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover"
            loading="eager"
          />

          <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight">
            <span className="italic text-accent">Smart</span> insurance{" "}
            <br className="hidden sm:block" />
            for landlords & tenants.
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Get a quote in seconds. Get covered in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Enter your property address..."
                className="w-full h-12 pl-10 pr-4 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button variant="hero" className="h-12 px-8 gap-2">
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
