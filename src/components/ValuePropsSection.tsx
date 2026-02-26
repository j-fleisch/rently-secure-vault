import { Zap, TrendingUp, Settings } from "lucide-react";

const props = [
  {
    tag: "SIMPLE",
    icon: Zap,
    title: "Fewer questions. Faster cover.",
    description:
      "Get a landlord or tenant policy online in minutes. No paperwork, no waiting for callbacks.",
  },
  {
    tag: "SCALABLE",
    icon: TrendingUp,
    title: "One property or a portfolio.",
    description:
      "Whether you own one rental or manage fifty, our policies flex to match your property portfolio.",
  },
  {
    tag: "FLEXIBLE",
    icon: Settings,
    title: "Total control. Seamless edits.",
    description:
      "Modify coverage, add properties, or adjust your policy instantly as your needs change.",
  },
];

const ValuePropsSection = () => {
  return (
    <section className="py-20 bg-card">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-12 md:gap-8">
          {props.map((p, i) => (
            <div key={p.tag} className="text-center md:text-left space-y-4">
              <span className="inline-block text-xs font-bold tracking-[0.2em] text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
                {p.tag}
              </span>
              <h3 className="text-2xl md:text-3xl">{p.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuePropsSection;
