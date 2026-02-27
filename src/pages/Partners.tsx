import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Handshake, TrendingUp, Shield, Users, Building, Briefcase } from "lucide-react";

const partnerTypes = [
  {
    icon: Building,
    title: "Lenders",
    description:
      "Offer your borrowers seamless property insurance at the point of mortgage approval. Reduce fall-throughs and add a new revenue stream.",
  },
  {
    icon: Users,
    title: "Real Estate Agents",
    description:
      "Provide your clients with instant insurance quotes during the buying process. Differentiate your service and earn referral income.",
  },
  {
    icon: Briefcase,
    title: "Mortgage Brokers",
    description:
      "Streamline the insurance step for your clients with our API integration. Close deals faster with embedded cover options.",
  },
  {
    icon: Handshake,
    title: "Property Managers",
    description:
      "Protect the portfolios you manage with bulk policies and centralised administration. Simplify compliance for every property.",
  },
];

const benefits = [
  {
    icon: TrendingUp,
    title: "New Revenue Stream",
    description: "Earn competitive referral commissions on every policy placed through your channel.",
  },
  {
    icon: Shield,
    title: "Trusted Brand Association",
    description: "Align with a modern, customer-first insurer that enhances your own brand reputation.",
  },
  {
    icon: Users,
    title: "Dedicated Partner Support",
    description: "Get a named account manager, co-branded materials, and priority claims handling for your clients.",
  },
];

const Partners = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="py-20 md:py-28 bg-card">
          <div className="container max-w-3xl text-center space-y-6">
            <span className="inline-block text-xs font-bold tracking-[0.2em] text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
              Partner Programme
            </span>
            <h1 className="text-4xl md:text-5xl">
              Grow your business with Cedar
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Join our partner network and offer your clients best-in-class property insurance — while unlocking new revenue and strengthening your service.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button variant="hero" size="lg" asChild>
                <a href="#become-a-partner">Become a Partner</a>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/quote">Get a Quote</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Partner Types */}
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-14 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl mb-4">Who we partner with</h2>
              <p className="text-muted-foreground">
                We work with professionals across the property ecosystem to deliver insurance where and when it's needed most.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {partnerTypes.map((p) => (
                <div
                  key={p.title}
                  className="group rounded-xl border border-border bg-card p-8 transition-all hover:shadow-lg hover:border-primary/30"
                >
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <p.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-2" style={{ letterSpacing: "0.04em" }}>
                    {p.title}
                  </h3>
                  <p className="text-base text-foreground leading-relaxed">
                    {p.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 bg-card">
          <div className="container">
            <div className="text-center mb-14 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl mb-4">Why partner with us</h2>
              <p className="text-muted-foreground">
                Cedar partners enjoy meaningful benefits that go beyond referral fees.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-12 md:gap-8 max-w-4xl mx-auto">
              {benefits.map((b) => (
                <div key={b.title} className="text-center space-y-4">
                  <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <b.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl">{b.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="become-a-partner" className="py-20">
          <div className="container max-w-2xl text-center space-y-6">
            <h2 className="text-3xl md:text-4xl">Ready to get started?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Get in touch with our partnerships team. We'll walk you through the programme, set up your account, and have you earning in no time.
            </p>
            <Button variant="hero" size="lg">
              Contact Partnerships
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Partners;
