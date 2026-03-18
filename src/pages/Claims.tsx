import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Phone, Mail, ExternalLink } from "lucide-react";

const CLAIMS_PARTNERS = [
  {
    id: "property-damage",
    label: "Property Damage (Fire, Water, Weather)",
    phones: [
      { label: "Toll-Free", number: "+1 (800) 555-2337" },
      { label: "Local (Toronto)", number: "+1 (416) 555-2337" },
    ],
    email: "propertyclaims@cedarpartner.ca",
    note: "Claims for property damage including fire, water, weather events, and vandalism are administered by our claims partner.",
    available: "24/7 Emergency Line Available",
  },
  {
    id: "liability",
    label: "Liability Claims",
    phones: [
      { label: "Toll-Free", number: "+1 (800) 555-5289" },
    ],
    email: "liability@cedarpartner.ca",
    note: "Claims for tenant or visitor injuries, slip-and-fall incidents, and other liability matters are administered by our claims partner.",
    available: "Mon–Fri, 8 AM – 6 PM ET",
  },
  {
    id: "rental-income",
    label: "Loss of Rental Income",
    phones: [
      { label: "Toll-Free", number: "+1 (800) 555-7362" },
    ],
    email: "rentalincome@cedarpartner.ca",
    note: "Claims for loss of rental income due to a covered peril are administered by our claims partner. Please have your policy number and tenant lease details ready.",
    available: "Mon–Fri, 8 AM – 6 PM ET",
  },
  {
    id: "equipment-breakdown",
    label: "Equipment Breakdown",
    phones: [
      { label: "Toll-Free", number: "+1 (800) 555-3948" },
    ],
    email: "equipment@cedarpartner.ca",
    note: "Claims for mechanical or electrical breakdown of building systems (HVAC, boilers, elevators) are administered by our claims partner.",
    available: "Mon–Fri, 8 AM – 6 PM ET",
  },
  {
    id: "sewer-backup",
    label: "Sewer Backup & Overland Water",
    phones: [
      { label: "Toll-Free", number: "+1 (800) 555-9271" },
      { label: "After-Hours Emergency", number: "+1 (800) 555-9272" },
    ],
    email: "waterclaims@cedarpartner.ca",
    note: "Claims for sewer backup and overland water damage are administered by our claims partner. Emergency mitigation services available 24/7.",
    available: "24/7 Emergency Line Available",
  },
];

export default function Claims() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 px-5">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
              Claims
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Need to make a claim? Rest assured our partners are here to help.
              Check your coverage documentation in your Cedar portal if you
              aren't sure which partner to contact.
            </p>
          </div>
        </section>

        {/* Accordion */}
        <section className="pb-24 px-5">
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {CLAIMS_PARTNERS.map((partner) => (
                <AccordionItem key={partner.id} value={partner.id}>
                  <AccordionTrigger className="text-base md:text-lg font-semibold text-foreground py-6 hover:no-underline">
                    {partner.label}
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="space-y-4">
                      {/* Phone numbers */}
                      <div className="flex flex-wrap gap-3">
                        {partner.phones.map((phone, i) => (
                          <a
                            key={i}
                            href={`tel:${phone.number}`}
                            className="inline-flex items-center gap-2.5 bg-card border border-border rounded-xl px-4 py-3 hover:border-accent/50 hover:shadow-sm transition-all group"
                          >
                            <Phone className="w-4 h-4 text-accent" />
                            <div>
                              <p className="text-xs text-muted-foreground leading-none mb-0.5">
                                {phone.label}
                              </p>
                              <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                                {phone.number}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>

                      {/* Email */}
                      <a
                        href={`mailto:${partner.email}`}
                        className="inline-flex items-center gap-2.5 bg-card border border-border rounded-xl px-4 py-3 hover:border-accent/50 hover:shadow-sm transition-all group"
                      >
                        <Mail className="w-4 h-4 text-accent" />
                        <div>
                          <p className="text-xs text-muted-foreground leading-none mb-0.5">
                            Email
                          </p>
                          <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                            {partner.email}
                          </p>
                        </div>
                      </a>

                      {/* Availability badge */}
                      {partner.available && (
                        <p className="text-xs font-medium text-accent">
                          {partner.available}
                        </p>
                      )}

                      {/* Note */}
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {partner.note}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Emergency banner */}
        <section className="pb-20 px-5">
          <div className="max-w-2xl mx-auto">
            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Phone className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="font-bold text-destructive mb-1">Emergency?</p>
                <p className="text-sm text-destructive/80">
                  If there is an active fire, gas leak, or safety threat, call{" "}
                  <span className="font-bold">911</span> first. Then contact our
                  24/7 emergency claims line at{" "}
                  <a
                    href="tel:+18885552337"
                    className="font-bold underline hover:no-underline"
                  >
                    1-888-555-CEDAR
                  </a>{" "}
                  for immediate assistance with emergency repairs and temporary
                  housing.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
