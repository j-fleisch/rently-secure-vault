import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    location: "Manchester, UK",
    text: "Got my landlord policy sorted in minutes. The process was incredibly smooth and saved me over £300 compared to my previous insurer.",
    initials: "SM",
  },
  {
    name: "James Okonkwo",
    location: "Birmingham, UK",
    text: "As a tenant, finding renters insurance was always a headache. ShieldRent made it simple and affordable. Highly recommended!",
    initials: "JO",
  },
  {
    name: "Laura Chen",
    location: "London, UK",
    text: "Managing multiple rental properties is stressful enough. ShieldRent handles all my insurance needs with one easy dashboard.",
    initials: "LC",
  },
  {
    name: "David Patel",
    location: "Leeds, UK",
    text: "Their claims process was swift and hassle-free. Had my payout within a week. Truly a landlord's best friend.",
    initials: "DP",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="bg-review text-review-foreground py-20">
      <div className="container">
        <div className="text-center mb-12">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-7 w-7 fill-accent text-accent" />
            ))}
          </div>
          <h2 className="text-3xl md:text-4xl">
            Trusted by landlords & tenants across the UK
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-xl bg-review-foreground/10 p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs opacity-70">{t.location}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed opacity-90">{t.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
