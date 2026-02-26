import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-illustration.webp";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="container py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight">
              <span className="italic text-accent">Simple,</span> affordable
              <br />property insurance
            </h1>

            <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Your property address..."
                  className="w-full h-12 pl-10 pr-4 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button variant="hero" className="h-12 px-8">
                Get a Quote
              </Button>
            </div>

            <div className="space-y-3">
              {[
                "Specialist landlord & tenant insurance",
                "Quote in seconds",
                "Comprehensive UK coverage",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:flex justify-center">
            <img
              src={heroImage}
              alt="Property protected by insurance shield illustration"
              className="w-full max-w-lg rounded-2xl"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
