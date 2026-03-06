import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, ArrowRight, ArrowLeft, FileText, Search, Phone, ChevronDown, ChevronUp, Check } from "lucide-react";

// ═══ TYPES ═══
type PortalView = "landing" | "apply" | "dashboard";

// ═══ MOCK DATA ═══
const PARTNER_TYPES = [
  {
    id: "lender",
    label: "Lender",
    desc: "Banks, credit unions, and alternative lenders",
    icon: "🏦",
    detail: "Embed insurance directly into your mortgage origination flow. Protect your collateral and offer borrowers a seamless closing experience.",
    benefits: [
      "Auto-trigger quotes at mortgage approval — zero friction for borrowers",
      "Proof of insurance delivered instantly to satisfy closing conditions",
      "Revenue share on every policy originated through your channel",
      "Dedicated API for deep integration into your LOS",
    ],
    volume: "",
    commission: "",
    integration: "API or widget embed",
  },
  {
    id: "mortgage-broker",
    label: "Mortgage Agent / Broker",
    desc: "Independent agents, brokerages, and networks",
    icon: "📋",
    detail: "Add landlord insurance to your service offering. Your clients already need it at closing — be the one who provides it.",
    benefits: [
      "Co-branded quoting page ready in minutes — no tech required",
      "Earn referral fees on every policy, including renewals",
      "Pre-fill quotes using mortgage application data your client already provided",
      "White-glove support for your high-value clients",
    ],
    volume: "",
    commission: "",
    integration: "Referral link or widget",
  },
  {
    id: "real-estate",
    label: "Real Estate Agent / Broker",
    desc: "Investor-focused agents and brokerages",
    icon: "🏠",
    detail: "Differentiate your service for investor clients. Offer instant insurance quotes as part of your closing package.",
    benefits: [
      "Stand out with investor clients — insurance quote at offer stage",
      "Referral commission on every policy your clients purchase",
      "Personalized landing page with your branding",
      "Works for both purchase and portfolio insurance reviews",
    ],
    volume: "",
    commission: "",
    integration: "Referral link",
  },
  {
    id: "property-manager",
    label: "Property Manager",
    desc: "Property management companies and platforms",
    icon: "🔑",
    detail: "Ensure every property in your portfolio has proper coverage. Embed insurance into your onboarding and compliance workflows.",
    benefits: [
      "Bulk-quote entire portfolios with a single upload",
      "Automated renewal tracking — never let a policy lapse",
      "Instant certificates of insurance for tenant and owner requests",
      "Revenue share plus reduced E&O exposure for your firm",
    ],
    volume: "",
    commission: "",
    integration: "API, widget, or bulk upload",
  },
];

const INTEGRATION_TIERS = [
  {
    tier: "Referral Link",
    effort: "Zero tech",
    time: "Live in 24 hours",
    desc: "We create a co-branded landing page at yourname.cedar.ca. Share the link with clients via email, text, or embed on your website.",
    features: ["Custom URL with your branding", "Track referrals in real-time", "Automated commission reporting", "No development needed"],
  },
  {
    tier: "Embeddable Widget",
    effort: "One line of code",
    time: "Live in 1 week",
    desc: "Drop a quote widget directly into your website or client portal. Clients get instant quotes without leaving your platform.",
    features: ["Branded to match your site", "Pre-fill from URL parameters", "Real-time quote results", "Conversion tracking & analytics"],
  },
  {
    tier: "Full API",
    effort: "Developer integration",
    time: "2-4 weeks",
    desc: "Deep integration into your existing systems. Quote, bind, service, and track policies entirely within your platform.",
    features: ["RESTful API with full documentation", "Quote, bind, endorse, renew, cancel", "Webhook notifications for status changes", "Sandbox environment for testing"],
  },
];

const MOCK_DASHBOARD = {
  partner: { name: "Apex Property Management", type: "Property Manager", since: "2025-06", tier: "Widget" },
  stats: {
    totalReferrals: 147, activePolicies: 118, conversionRate: 80.3,
    totalGWP: 167400, totalCommission: 28458, pendingCommission: 3240,
    mtdReferrals: 14, mtdPolicies: 11, mtdCommission: 2860,
  },
  recentActivity: [
    { date: "2026-03-02", event: "Policy bound", detail: "456 Dundas St E — Standard Plan — $1,890/yr", amount: 340 },
    { date: "2026-03-01", event: "Quote generated", detail: "22 Elm St, Toronto — Awaiting client decision", amount: null },
    { date: "2026-02-28", event: "Renewal processed", detail: "789 King St — Auto-renewed — $1,155/yr", amount: 208 },
    { date: "2026-02-27", event: "Policy bound", detail: "15 Maple Ave, Mississauga — Premium Plan — $3,210/yr", amount: 578 },
    { date: "2026-02-25", event: "Commission paid", detail: "February payout deposited", amount: 4120 },
    { date: "2026-02-24", event: "Quote generated", detail: "88 Front St W — Client reviewing options", amount: null },
    { date: "2026-02-22", event: "Policy bound", detail: "330 Bay St, Unit 2201 — Basic Plan — $980/yr", amount: 176 },
  ],
  topProperties: [
    { address: "456 Dundas St E, Toronto", premium: 1890, status: "Active" },
    { address: "123 Queen St W, Toronto", premium: 2340, status: "Active" },
    { address: "15 Maple Ave, Mississauga", premium: 3210, status: "Active" },
    { address: "789 King St, Hamilton", premium: 1155, status: "Renewal Due" },
    { address: "330 Bay St, Unit 2201", premium: 980, status: "Active" },
  ],
};

const PROVINCES = ["Ontario", "British Columbia", "Alberta", "Quebec", "Manitoba", "Saskatchewan", "Nova Scotia", "New Brunswick", "Newfoundland", "PEI"];

// ═══ REUSABLE ═══
function SelectionCard({ selected, onClick, label, description, icon, extra }: {
  selected: boolean; onClick: () => void; label: string; description?: string; icon?: React.ReactNode; extra?: string;
}) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
        selected ? "border-accent bg-accent/10 shadow-md" : "border-border bg-card hover:border-accent/40 hover:shadow-sm"
      }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <span className="text-xl">{icon}</span>}
          <div>
            <p className="font-semibold text-foreground">{label}</p>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {extra && <span className="text-xs font-medium text-accent">{extra}</span>}
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            selected ? "border-accent bg-accent" : "border-muted-foreground/30"
          }`}>
            {selected && <CheckCircle className="w-3 h-3 text-white" />}
          </div>
        </div>
      </div>
    </button>
  );
}

function StepProgress({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center mb-8 flex-wrap gap-y-2">
      {steps.map((label, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                active || done ? "bg-accent text-white" : "bg-muted text-muted-foreground"
              }`}>
                {done ? "✓" : i + 1}
              </div>
              <span className={`text-sm ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{label}</span>
            </div>
            {i < steps.length - 1 && <div className={`w-8 h-0.5 mx-2 ${done ? "bg-accent" : "bg-muted"}`} />}
          </div>
        );
      })}
    </div>
  );
}

// ═══ PARTNER LANDING ═══
function PartnerLanding({ onApply, onLogin }: { onApply: () => void; onLogin: () => void }) {
  const [expandedType, setExpandedType] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 md:py-28 bg-card text-center">
        <div className="container max-w-3xl space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--accent))" strokeWidth="2" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">Partner with Cedar</h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Earn additional revenue by embedding landlord insurance into your existing client relationships. Your clients already need it — be the one who delivers it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button onClick={onApply}
              className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors shadow-lg">
              Apply to Partner
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={onLogin}
              className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary px-8 py-3 rounded-xl font-semibold hover:bg-primary hover:text-primary-foreground transition-colors">
              Partner Login
            </button>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 max-w-2xl mx-auto">
            {[
              { num: "$2.4M+", label: "Partner-originated GWP" },
              { num: "85%+", label: "Client retention rate" },
              { num: "180+", label: "Active partners" },
              { num: "2%-5%", label: "Referral commission" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-extrabold text-accent">{s.num}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Types */}
      <section className="py-20">
        <div className="container max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-2">Built for your business</h2>
          <p className="text-muted-foreground text-center mb-10">Select your partner type to see how Cedar fits into your workflow.</p>

          <div className="flex flex-col gap-4">
            {PARTNER_TYPES.map((pt) => (
              <div key={pt.id}
                className="rounded-2xl border-2 border-border bg-card overflow-hidden cursor-pointer hover:border-accent/40 transition-all"
                onClick={() => setExpandedType(expandedType === pt.id ? null : pt.id)}>
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{pt.icon}</span>
                    <div>
                      <p className="font-bold text-foreground text-lg">{pt.label}</p>
                      <p className="text-sm text-muted-foreground">{pt.desc}</p>
                    </div>
                  </div>
                  {expandedType === pt.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <div className="flex items-center gap-3">
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {expandedType === pt.id && (
                  <div className="px-6 pb-6 border-t border-border pt-4">
                    <p className="text-foreground mb-4">{pt.detail}</p>
                    <div className="space-y-2 mb-4">
                      {pt.benefits.map((b, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{b}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-muted/30 rounded-xl p-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Integration</p>
                        <p className="text-sm font-semibold text-foreground">{pt.integration}</p>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onApply(); }}
                      className="w-full bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors">
                      Apply as {pt.label}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Tiers */}
      <section className="py-20 bg-card">
        <div className="container max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-2">Integration options</h2>
          <p className="text-muted-foreground text-center mb-10">Start simple and scale up as your volume grows.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {INTEGRATION_TIERS.map((t, i) => (
              <div key={i} className="rounded-2xl border-2 border-border bg-background p-7 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{t.tier}</h3>
                </div>
                <div className="flex gap-2 mb-4">
                  <span className="text-xs font-medium bg-muted text-muted-foreground px-3 py-1 rounded-full whitespace-nowrap">{t.effort}</span>
                  <span className="text-xs font-medium bg-muted text-muted-foreground px-3 py-1 rounded-full whitespace-nowrap">{t.time}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{t.desc}</p>
                <div className="space-y-3 mt-auto">
                  {t.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground leading-snug">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container max-w-2xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Ready to get started?</h2>
          <p className="text-muted-foreground leading-relaxed">Apply in 5 minutes. Most partners are live within 48 hours.</p>
          <button onClick={onApply}
            className="bg-accent text-white px-10 py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors shadow-lg">
            Apply Now
          </button>
        </div>
      </section>
    </div>
  );
}

// ═══ PARTNER APPLICATION FLOW ═══
function PartnerApplication({ onBack, onComplete }: { onBack: () => void; onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [partnerType, setPartnerType] = useState("");
  const [company, setCompany] = useState<any>({
    name: "", website: "", province: "", city: "", phone: "", yearsInBusiness: "", licenseNumber: "",
  });
  const [contact, setContact] = useState<any>({
    firstName: "", lastName: "", email: "", phone: "", title: "",
  });
  const [business, setBusiness] = useState<any>({
    annualVolume: "", clientTypes: [] as string[], currentInsurance: "",
    integrationPreference: "", additionalNotes: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const STEPS = ["Type", "Company", "Contact", "Business", "Review"];

  const nextStep = useCallback(() => {
    if (step === 4) { setSubmitted(true); return; }
    setStep((s) => Math.min(s + 1, 4));
  }, [step]);

  const prevStep = useCallback(() => {
    if (step === 0) onBack(); else setStep((s) => s - 1);
  }, [step, onBack]);

  const canProceed =
    step === 0 ? !!partnerType :
    step === 1 ? !!company.name && !!company.province :
    step === 2 ? !!contact.firstName && !!contact.lastName && !!contact.email :
    step === 3 ? !!business.annualVolume :
    agreed;

  const ptInfo = PARTNER_TYPES.find((p) => p.id === partnerType);

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-16 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
          <Check className="w-9 h-9 text-green-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-foreground mb-3">Application Submitted</h2>
        <p className="text-muted-foreground mb-6">
          Thanks, {contact.firstName}! We've received your application for the Cedar Partner Program.
        </p>
        <div className="bg-card border-2 border-border rounded-xl p-6 my-8 inline-block text-left">
          <p className="text-sm font-medium text-foreground">Company: {company.name}</p>
          <p className="text-sm font-medium text-foreground">Partner Type: {ptInfo?.label}</p>
          <p className="text-sm font-medium text-foreground">Contact: {contact.firstName} {contact.lastName}</p>
          <p className="text-sm font-medium text-foreground">Email: {contact.email}</p>
        </div>
        <div className="bg-accent/10 rounded-xl p-5 text-left max-w-md mx-auto mb-8">
          <p className="font-semibold text-accent mb-2">What happens next?</p>
          <div className="space-y-3">
            {[
              "Our partnerships team will review your application (1-2 business days)",
              "You'll receive an email to schedule a quick intro call",
              "We'll get you set up with your preferred integration tier",
              "Start referring clients and earning commissions",
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-accent font-bold text-sm mt-0.5">{i + 1}.</span>
                <span className="text-sm text-accent">{s}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={onBack}
          className="px-6 py-3 rounded-xl font-semibold border-2 border-border text-foreground hover:border-accent/40 transition-colors">
          Back to Partners
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <StepProgress steps={STEPS} current={step} />

      {/* STEP 1: PARTNER TYPE */}
      {step === 0 && (
        <div>
          <h2 className="text-2xl font-extrabold text-foreground mb-1">What type of partner are you?</h2>
          <p className="text-muted-foreground mb-6">This helps us tailor the program to your business.</p>
          <div className="flex flex-col gap-3">
            {PARTNER_TYPES.map((pt) => (
              <SelectionCard key={pt.id} selected={partnerType === pt.id}
                onClick={() => setPartnerType(pt.id)}
                label={pt.label} description={pt.desc} icon={pt.icon}
                extra={pt.commission} />
            ))}
          </div>
          {partnerType && ptInfo && (
            <div className="mt-6 bg-accent/10 rounded-xl p-5">
              <p className="text-sm text-foreground mb-3">{ptInfo.detail}</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Commission</p>
                  <p className="text-sm font-bold text-accent">{ptInfo.commission}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Min Volume</p>
                  <p className="text-sm font-bold text-foreground">{ptInfo.volume}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Integration</p>
                  <p className="text-sm font-bold text-foreground">{ptInfo.integration}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: COMPANY */}
      {step === 1 && (
        <div>
          <h2 className="text-2xl font-extrabold text-foreground mb-1">Company details</h2>
          <p className="text-muted-foreground mb-6">Tell us about your organization.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Company Name *</label>
              <input type="text" value={company.name}
                onChange={(e) => setCompany((c: any) => ({ ...c, name: e.target.value }))}
                placeholder="e.g. Apex Property Management"
                className="w-full p-3 rounded-lg border-2 border-border bg-card text-foreground outline-none focus:border-accent transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Website</label>
              <input type="text" value={company.website}
                onChange={(e) => setCompany((c: any) => ({ ...c, website: e.target.value }))}
                placeholder="https://www.yourcompany.ca"
                className="w-full p-3 rounded-lg border-2 border-border bg-card text-foreground outline-none focus:border-accent transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Province *</label>
                <select value={company.province}
                  onChange={(e) => setCompany((c: any) => ({ ...c, province: e.target.value }))}
                  className="w-full p-3 rounded-lg border-2 border-border bg-card text-foreground outline-none focus:border-accent transition-colors appearance-none cursor-pointer">
                  <option value="">Select province</option>
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">City</label>
                <input type="text" value={company.city}
                  onChange={(e) => setCompany((c: any) => ({ ...c, city: e.target.value }))}
                  placeholder="e.g. Toronto"
                  className="w-full p-3 rounded-lg border-2 border-border bg-card text-foreground outline-none focus:border-accent transition-colors" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Phone</label>
                <input type="text" value={company.phone}
                  onChange={(e) => setCompany((c: any) => ({ ...c, phone: e.target.value }))}
                  placeholder="(416) 555-0123"
                  className="w-full p-3 rounded-lg border-2 border-border bg-card text-foreground outline-none focus:border-accent transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Years in Business</label>
                <select value={company.yearsInBusiness}
                  onChange={(e) => setCompany((c: any) => ({ ...c, yearsInBusiness: e.target.value }))}
                  className="w-full p-3 rounded-lg border-2 border-border bg-card text-foreground outline-none focus:border-accent transition-colors appearance-none cursor-pointer">
                  <option value="">Select</option>
                  {["Less than 1 year", "1-3 years", "3-5 years", "5-10 years", "10+ years"].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            {partnerType === "mortgage-broker" && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">FSRA License Number</label>
                <input type="text" value={company.licenseNumber}
                  onChange={(e) => setCompany((c: any) => ({ ...c, licenseNumber: e.target.value }))}
                  placeholder="e.g. M12345678"
                  className="w-full p-3 rounded-lg border-2 border-border bg-card text-foreground outline-none focus:border-accent transition-colors" />
              </div>
            )}
            {partnerType === "real-estate" && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">RECO Registration Number</label>
                <input type="text" value={company.licenseNumber}
                  onChange={(e) => setCompany((c: any) => ({ ...c, licenseNumber: e.target.value }))}
                  placeholder="e.g. 12345"
                  className="w-full p-3 rounded-lg border-2 border-border bg-card text-foreground outline-none focus:border-accent transition-colors" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: CONTACT */}
      {step === 2 && (
        <div>
          <h2 className="text-2xl font-extrabold text-foreground mb-1">Primary contact</h2>
          <p className="text-muted-foreground mb-6">Who should we reach out to about the partnership?</p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">First Name *</label>
                <input type="text" value={contact.firstName}
                  onChange={(e) => setContact((c: any) => ({ ...c, firstName: e.target.value }))}
                  placeholder="First name"
                  className="w-full p-3 rounded-lg border-2 border-border bg-card text-foreground outline-none focus:border-accent transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Last Name *</label>
                <input type="text" value={contact.lastName}
                  onChange={(e) => setContact((c: any) => ({ ...c, lastName: e.target.value }))}
                  placeholder="Last name"
                  className="w-full p-3 rounded-lg border-2 border-border bg-card text-foreground outline-none focus:border-accent transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Email *</label>
              <input type="email" value={contact.email}
                onChange={(e) => setContact((c: any) => ({ ...c, email: e.target.value }))}
                placeholder="you@company.ca"
                className="w-full p-3 rounded-lg border-2 border-border bg-card text-foreground outline-none focus:border-accent transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Phone</label>
                <input type="text" value={contact.phone}
                  onChange={(e) => setContact((c: any) => ({ ...c, phone: e.target.value }))}
                  placeholder="(416) 555-0123"
                  className="w-full p-3 rounded-lg border-2 border-border bg-card text-foreground outline-none focus:border-accent transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Title / Role</label>
                <input type="text" value={contact.title}
                  onChange={(e) => setContact((c: any) => ({ ...c, title: e.target.value }))}
                  placeholder="e.g. Managing Partner"
                  className="w-full p-3 rounded-lg border-2 border-border bg-card text-foreground outline-none focus:border-accent transition-colors" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: BUSINESS */}
      {step === 3 && (
        <div>
          <h2 className="text-2xl font-extrabold text-foreground mb-1">Business details</h2>
          <p className="text-muted-foreground mb-6">Help us understand your volume and client base.</p>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-2">
              {partnerType === "lender" ? "Annual mortgage originations" :
               partnerType === "mortgage-broker" ? "Annual mortgage closings" :
               partnerType === "real-estate" ? "Annual transactions (investment properties)" :
               "Total doors managed"} *
            </label>
            <div className="flex flex-col gap-2">
              {(partnerType === "property-manager"
                ? ["Under 50", "50-200", "200-500", "500-1,000", "1,000+"]
                : ["Under 50", "50-100", "100-250", "250-500", "500+"]
              ).map((v) => (
                <SelectionCard key={v} selected={business.annualVolume === v}
                  onClick={() => setBusiness((b: any) => ({ ...b, annualVolume: v }))} label={v} />
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-2">Client types you serve (select all)</label>
            <div className="grid grid-cols-2 gap-2">
              {["Individual landlords", "Corporate investors", "REITs / Institutional", "First-time investors", "Multi-property owners", "Condo investors"].map((ct) => (
                <SelectionCard key={ct}
                  selected={business.clientTypes.includes(ct)}
                  onClick={() => setBusiness((b: any) => ({
                    ...b,
                    clientTypes: b.clientTypes.includes(ct)
                      ? b.clientTypes.filter((c: string) => c !== ct)
                      : [...b.clientTypes, ct],
                  }))}
                  label={ct} />
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-2">How do your clients currently get landlord insurance?</label>
            <div className="flex flex-col gap-2">
              {[
                { v: "broker", l: "Through a traditional insurance broker" },
                { v: "direct", l: "Direct from an insurer" },
                { v: "unsure", l: "Not sure / varies" },
                { v: "none", l: "Many don't have proper coverage" },
              ].map((o) => (
                <SelectionCard key={o.v} selected={business.currentInsurance === o.v}
                  onClick={() => setBusiness((b: any) => ({ ...b, currentInsurance: o.v }))} label={o.l} />
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-2">Preferred integration</label>
            <div className="flex flex-col gap-2">
              {INTEGRATION_TIERS.map((t) => (
                <SelectionCard key={t.tier} selected={business.integrationPreference === t.tier}
                  onClick={() => setBusiness((b: any) => ({ ...b, integrationPreference: t.tier }))}
                  label={t.tier} description={`${t.effort} · ${t.time}`} />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Anything else you'd like us to know?</label>
            <textarea value={business.additionalNotes}
              onChange={(e) => setBusiness((b: any) => ({ ...b, additionalNotes: e.target.value }))}
              placeholder="Current tech stack, specific integration needs, timeline, etc."
              rows={3}
              className="w-full p-3 rounded-lg border-2 border-border bg-card text-foreground outline-none focus:border-accent transition-colors resize-none" />
          </div>
        </div>
      )}

      {/* STEP 5: REVIEW */}
      {step === 4 && (
        <div>
          <h2 className="text-2xl font-extrabold text-foreground mb-1">Review your application</h2>
          <p className="text-muted-foreground mb-6">Confirm everything looks good before submitting.</p>

          <div className="space-y-4">
            <div className="bg-card border-2 border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground">Partner Type</h3>
                <button onClick={() => setStep(0)} className="text-xs text-accent font-semibold hover:underline">Edit</button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">{ptInfo?.icon}</span>
                <div>
                  <p className="font-medium text-foreground">{ptInfo?.label}</p>
                  <p className="text-sm text-muted-foreground">Commission: {ptInfo?.commission}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border-2 border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground">Company</h3>
                <button onClick={() => setStep(1)} className="text-xs text-accent font-semibold hover:underline">Edit</button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{company.name}</span></div>
                <div><span className="text-muted-foreground">Province:</span> <span className="font-medium">{company.province}</span></div>
                {company.website && <div><span className="text-muted-foreground">Website:</span> <span className="font-medium">{company.website}</span></div>}
                {company.city && <div><span className="text-muted-foreground">City:</span> <span className="font-medium">{company.city}</span></div>}
              </div>
            </div>

            <div className="bg-card border-2 border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground">Contact</h3>
                <button onClick={() => setStep(2)} className="text-xs text-accent font-semibold hover:underline">Edit</button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{contact.firstName} {contact.lastName}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{contact.email}</span></div>
                {contact.title && <div><span className="text-muted-foreground">Title:</span> <span className="font-medium">{contact.title}</span></div>}
              </div>
            </div>

            <div className="bg-card border-2 border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground">Business</h3>
                <button onClick={() => setStep(3)} className="text-xs text-accent font-semibold hover:underline">Edit</button>
              </div>
              <div className="text-sm space-y-2">
                <div><span className="text-muted-foreground">Volume:</span> <span className="font-medium">{business.annualVolume}</span></div>
                {business.clientTypes.length > 0 && <div><span className="text-muted-foreground">Clients:</span> <span className="font-medium">{business.clientTypes.join(", ")}</span></div>}
                {business.integrationPreference && <div><span className="text-muted-foreground">Integration:</span> <span className="font-medium">{business.integrationPreference}</span></div>}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <SelectionCard selected={agreed} onClick={() => setAgreed(!agreed)}
              label="I agree to Cedar's Partner Terms of Service"
              description="You'll receive the full agreement for review before your partnership is activated." />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center mt-10 pt-5 border-t border-border">
        <button onClick={prevStep}
          className="px-6 py-3 rounded-xl font-semibold border-2 border-border text-foreground hover:border-accent/40 transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          {step === 0 ? "Partners" : "Back"}
        </button>
        <button onClick={nextStep} disabled={!canProceed}
          className="bg-accent text-white px-6 py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          {step === 4 ? "Submit Application" : "Continue"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ═══ PARTNER DASHBOARD ═══
function PartnerDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<"overview" | "activity" | "properties">("overview");
  const d = MOCK_DASHBOARD;

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Partner Dashboard</p>
          <h1 className="text-2xl font-extrabold text-foreground">{d.partner.name}</h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">{d.partner.type}</span>
            <span className="text-xs text-muted-foreground">Partner since {d.partner.since}</span>
            <span className="text-xs text-muted-foreground">· {d.partner.tier} integration</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-xl font-semibold bg-accent text-white hover:bg-accent/90 transition-colors text-sm">
            Generate Referral Link
          </button>
          <button onClick={onLogout}
            className="px-5 py-2.5 rounded-xl font-semibold border-2 border-border text-foreground hover:border-accent/40 transition-colors text-sm">
            Log Out
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Policies", value: d.stats.activePolicies, sub: `${d.stats.mtdPolicies} this month`, accent: false },
          { label: "Total GWP", value: `$${d.stats.totalGWP.toLocaleString()}`, sub: `${d.stats.totalReferrals} total referrals`, accent: false },
          { label: "Total Commission", value: `$${d.stats.totalCommission.toLocaleString()}`, sub: `$${d.stats.mtdCommission.toLocaleString()} this month`, accent: true },
          { label: "Conversion Rate", value: `${d.stats.conversionRate}%`, sub: `$${d.stats.pendingCommission.toLocaleString()} pending`, accent: false },
        ].map((kpi, i) => (
          <div key={i} className={`rounded-2xl p-5 border-2 ${kpi.accent ? "bg-accent border-accent" : "bg-card border-border"}`}>
            <p className={`text-xs font-medium mb-1 ${kpi.accent ? "text-white/70" : "text-muted-foreground"}`}>{kpi.label}</p>
            <p className={`text-2xl font-extrabold ${kpi.accent ? "text-white" : "text-foreground"}`}>{kpi.value}</p>
            <p className={`text-xs mt-1 ${kpi.accent ? "text-white/60" : "text-muted-foreground"}`}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-muted/30 rounded-xl p-1 w-fit">
        {([
          { id: "overview" as const, label: "Overview" },
          { id: "activity" as const, label: "Recent Activity" },
          { id: "properties" as const, label: "Properties" },
        ]).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}>{t.label}</button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border-2 border-border rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-4">Monthly Performance</h3>
            <div className="space-y-3">
              {[
                { month: "March 2026", referrals: 14, policies: 11, commission: 2860 },
                { month: "February 2026", referrals: 22, policies: 18, commission: 4120 },
                { month: "January 2026", referrals: 19, policies: 15, commission: 3540 },
                { month: "December 2025", referrals: 16, policies: 13, commission: 2980 },
                { month: "November 2025", referrals: 24, policies: 20, commission: 4680 },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-foreground font-medium">{m.month}</span>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-muted-foreground">{m.referrals} refs</span>
                    <span className="text-muted-foreground">{m.policies} bound</span>
                    <span className="font-semibold text-accent">${m.commission.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card border-2 border-border rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {[
                  { label: "Generate a quote for a client", desc: "Pre-fill with client property details", action: "New Quote" },
                  { label: "Download commission statement", desc: "February 2026 statement ready", action: "Download" },
                  { label: "Update company information", desc: "Company details, banking, contacts", action: "Settings" },
                  { label: "Access marketing materials", desc: "Co-branded flyers, email templates", action: "View" },
                ].map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.label}</p>
                      <p className="text-xs text-muted-foreground">{a.desc}</p>
                    </div>
                    <button className="text-xs text-accent font-semibold hover:underline">{a.action}</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6">
              <p className="text-sm text-accent font-semibold mb-1">Pending Commission</p>
              <p className="text-3xl font-extrabold text-accent">${d.stats.pendingCommission.toLocaleString()}</p>
              <p className="text-xs text-accent/60 mt-1">Next payout: March 15, 2026</p>
            </div>
          </div>
        </div>
      )}

      {/* Activity */}
      {tab === "activity" && (
        <div className="bg-card border-2 border-border rounded-2xl p-6">
          <h3 className="font-bold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-0">
            {d.recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-4 py-4 border-b border-border last:border-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                  a.event === "Policy bound" ? "bg-green-100 text-green-700" :
                  a.event === "Commission paid" ? "bg-accent/10 text-accent" :
                  a.event === "Renewal processed" ? "bg-blue-100 text-blue-700" : "bg-muted/50 text-muted-foreground"
                }`}>
                  {a.event === "Policy bound" ? "✓" :
                   a.event === "Commission paid" ? "$" :
                   a.event === "Renewal processed" ? "↻" : "→"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{a.event}</p>
                    <span className="text-xs text-muted-foreground">{a.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{a.detail}</p>
                </div>
                {a.amount && (
                  <span className="text-sm font-bold text-accent flex-shrink-0">+${a.amount.toLocaleString()}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Properties */}
      {tab === "properties" && (
        <div className="bg-card border-2 border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Referred Properties</h3>
            <button className="text-sm text-accent font-semibold hover:underline">Export CSV</button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground py-3">Property</th>
                <th className="text-left text-xs font-semibold text-muted-foreground py-3">Premium</th>
                <th className="text-left text-xs font-semibold text-muted-foreground py-3">Status</th>
                <th className="text-right text-xs font-semibold text-muted-foreground py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {d.topProperties.map((p, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="py-3">
                    <p className="text-sm font-medium text-foreground">{p.address}</p>
                  </td>
                  <td className="py-3">
                    <p className="text-sm text-foreground">${p.premium.toLocaleString()}/yr</p>
                  </td>
                  <td className="py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      p.status === "Active" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                    }`}>{p.status}</span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="text-xs text-accent font-semibold hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══ MAIN PAGE ═══
const Partners = () => {
  const [view, setView] = useState<PortalView>("landing");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        {view === "landing" && (
          <PartnerLanding
            onApply={() => setView("apply")}
            onLogin={() => setView("dashboard")}
          />
        )}
        {view === "apply" && (
          <PartnerApplication
            onBack={() => setView("landing")}
            onComplete={() => setView("landing")}
          />
        )}
        {view === "dashboard" && (
          <PartnerDashboard onLogout={() => setView("landing")} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Partners;
