import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20">
      <div className="container">
        <div className="rounded-2xl bg-primary p-12 md:p-16 text-center text-primary-foreground">
          <h2 className="text-3xl md:text-4xl mb-4">
            Ready to protect your property?
          </h2>
          <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8">
            Join thousands of landlords and tenants who trust ShieldRent for fast, affordable, and comprehensive insurance cover.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              className="font-semibold"
            >
              Get a Quote
            </Button>
            <Button
              variant="hero-outline"
              size="lg"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              Talk to an Expert
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
