import { Home, Users, Shield, FileText, Zap, Headphones } from "lucide-react";

const features = [
  {
    icon: Home,
    title: "Landlord Insurance",
    description: "Comprehensive cover for buildings, contents, and rental income protection for property owners.",
  },
  {
    icon: Users,
    title: "Tenant Insurance",
    description: "Affordable renters insurance covering personal belongings, liability, and accidental damage.",
  },
  {
    icon: Shield,
    title: "Liability Cover",
    description: "Public liability and employer's liability protection to safeguard against claims.",
  },
  {
    icon: FileText,
    title: "Rent Guarantee",
    description: "Protect your rental income with our rent guarantee and legal expenses cover.",
  },
  {
    icon: Zap,
    title: "Instant Quotes",
    description: "Get a tailored insurance quote in under 60 seconds. No paperwork, no hassle.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description: "Expert claims handling and support from our specialist property insurance team.",
  },
];

const FeaturesSection = () => {
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
              <h3 className="text-xl font-serif font-bold mb-2 tracking-wide">{f.title}</h3>
              <p className="text-base text-foreground leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
