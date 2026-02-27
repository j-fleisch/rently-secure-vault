import { useState } from "react";
import { Home, Users, Shield, FileText, Zap, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Home,
    title: "Landlord Insurance",
    description: "Comprehensive cover for buildings, contents, and rental income protection for property owners.",
    learnMore: "Landlord insurance protects your investment property against damage, liability claims, and loss of rental income. Whether you own a single rental unit or a portfolio of properties, our policies cover building structure, contents, and legal expenses — giving you peace of mind as a property owner.",
  },
  {
    icon: Users,
    title: "Tenant Insurance",
    description: "Affordable renters insurance covering personal belongings, liability, and accidental damage.",
    learnMore: "Tenant insurance (also known as renters insurance) covers your personal belongings against theft, fire, and water damage. It also includes personal liability protection in case someone is injured in your rental unit, plus additional living expenses if your home becomes uninhabitable.",
  },
  {
    icon: Shield,
    title: "Liability Cover",
    description: "Public liability and employer's liability protection to safeguard against claims.",
    learnMore: "Liability coverage protects you from financial loss if someone is injured on your property or if you accidentally cause damage to someone else's property. This is essential for landlords who have tenants, visitors, or contractors on their premises.",
  },
  {
    icon: FileText,
    title: "Rent Guarantee",
    description: "Protect your rental income with our rent guarantee and legal expenses cover.",
    learnMore: "Rent guarantee insurance ensures you continue receiving rental income even if your tenant defaults on payments. It also covers legal expenses for eviction proceedings, giving landlords financial security and reducing the stress of tenant disputes.",
  },
  {
    icon: Zap,
    title: "Instant Quotes",
    description: "Get a tailored insurance quote in under 60 seconds. No paperwork, no hassle.",
    learnMore: "Our streamlined quoting process uses smart technology to deliver accurate, personalised quotes in seconds. Simply answer a few questions about your property and coverage needs, and we'll provide competitive options instantly — no phone calls or paperwork required.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description: "Expert claims handling and support from our specialist property insurance team.",
    learnMore: "Our dedicated support team specialises in property insurance and is available to help with claims, policy adjustments, and any questions you may have. We pride ourselves on fast response times and personalised service to ensure your experience is seamless.",
  },
];

const FeaturesSection = () => {
  const [openFeature, setOpenFeature] = useState<string | null>(null);

  const activeFeature = features.find((f) => f.title === openFeature);

  return (
    <section id="landlords" className="py-20">
      <div className="container">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl mb-4">
            Everything you need to protect your property
          </h2>
          <p className="text-muted-foreground">
            Whether you're a landlord with a portfolio or a tenant renting your first flat, we've got you covered.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-border bg-card p-8 transition-all hover:shadow-lg hover:border-primary/30"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2" style={{ letterSpacing: "0.08em" }}>
                {f.title}
              </h3>
              <p className="text-base text-foreground leading-relaxed mb-4">
                {f.description}
              </p>
              <button
                onClick={() => setOpenFeature(f.title)}
                className="text-sm font-medium text-accent hover:text-accent/80 underline underline-offset-4 transition-colors"
              >
                Learn more
              </button>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!openFeature} onOpenChange={(open) => !open && setOpenFeature(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl" style={{ letterSpacing: "0.08em" }}>
              {activeFeature?.title}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-foreground/80 leading-relaxed text-base">
            {activeFeature?.learnMore}
          </DialogDescription>
          <div className="pt-4">
            <Button asChild className="w-full">
              <Link to="/quote">Get a Quote</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default FeaturesSection;
