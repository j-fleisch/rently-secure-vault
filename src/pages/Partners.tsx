import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, ArrowRight, ArrowLeft, ChevronDown, ChevronUp, Check, Zap, Clock, Link2, Calculator, Shield, Users, Building2, Key, FileText } from "lucide-react";

// ═══ TYPES ═══
type PortalView = "landing" | "apply" | "dashboard";

// ═══ MOCK DATA ═══
const PARTNER_TYPES = [
  {
    id: "mortgage-brokerage",
    label: "Mortgage Brokerage",
    desc: "Brokerages and independent mortgage agents",
    icon: "📋",
    detail: "Your agents already handle insurance conditions at closing. Cedar eliminates the back-and-forth by giving them instant quoting tools that work inside their existing workflow — no more chasing clients for proof of insurance.",
    benefits: [
      "Instant insurance quotes embedded in your closing workflow — no broker tag required",
      "Smart links let agents send clients a pre-filled quote in one click",
      "Reduce days-to-close by removing the insurance condition bottleneck",
      "White-label experience — your brand, your client relationship",
      "Built-in cost estimator agents can share at pre-approval stage",
    ],
    integration: "Smart link or widget",
  },
  {
    id: "real-estate-brokerage",
    label: "Real Estate Brokerage",
    desc: "Brokerages and investor-focused agents",
    icon: "🏠",
    detail: "Insurance is the last loose end in every investment property transaction. Cedar gives your agents a tool to resolve it instantly — right from the offer stage — so deals close faster and clients stay happy.",
    benefits: [
      "Agents share a smart link at offer stage — client gets a quote in minutes",
      "Instant cost estimator helps investors budget before they even make an offer",
      "No more back-and-forth with insurance brokers delaying closing",
      "Branded experience — your agents look like they have it all figured out",
      "Works for purchases, portfolio reviews, and renewals",
    ],
    integration: "Smart link or branded page",
  },
  {
    id: "lender",
    label: "Lender",
    desc: "Banks, credit unions, and alternative lenders",
    icon: "🏦",
    detail: "Embed insurance directly into your mortgage origination flow. Protect your collateral and offer borrowers a seamless closing experience with zero friction.",
    benefits: [
      "Auto-trigger quotes at mortgage approval — zero friction for borrowers",
      "Proof of insurance delivered instantly to satisfy closing conditions",
      "Dedicated API for deep integration into your LOS",
      "Reduce time-to-close on investment property mortgages",
    ],
    integration: "API or widget embed",
  },
  {
    id: "property-manager",
    label: "Property Manager",
    desc: "Property management companies and platforms",
    icon: "🔑",
    detail: "Ensure every property in your portfolio has proper coverage. Embed insurance into your onboarding and compliance workflows — no manual follow-ups.",
    benefits: [
      "Bulk-quote entire portfolios with a single upload",
      "Automated renewal tracking — never let a policy lapse",
      "Instant certificates of insurance for tenant and owner requests",
      "Reduced E&O exposure for your firm",
    ],
    integration: "API, widget, or bulk upload",
  },
];

// ═══ VALUE PROPS — focus on transaction simplification ═══
const VALUE_PROPS = [
  {
    icon: Zap,
    title: "Smart Links",
    description: "Generate a pre-filled quote link for any client. They click, confirm a few details, and they're covered — no phone calls, no forms, no delays.",
  },
  {
    icon: Calculator,
    title: "Instant Cost Estimator",
    description: "Give clients a ballpark insurance cost before they even make an offer. Helps investors budget accurately and removes surprises at closing.",
  },
  {
    icon: Clock,
    title: "Faster Closings",
    description: "Insurance conditions are the #1 cause of closing delays on investment properties. Cedar resolves them in minutes, not days.",
  },
  {
    icon: Users,
    title: "Zero Friction for Clients",
    description: "Your clients get a seamless digital experience — no calling around, no faxing declarations pages, no waiting for callbacks from brokers.",
  },
  {
    icon: Shield,
    title: "Proper Coverage, Every Time",
    description: "Purpose-built for rental properties. No generic homeowner policies that leave gaps — every policy is tailored for landlords.",
  },
  {
    icon: Link2,
    title: "Brokerage-Level Tools",
    description: "Dashboard for your team to track quotes, monitor closings, and see which agents are driving the most value for clients.",
  },
];

const INTEGRATION_TIERS = [
  {
    tier: "Smart Link",
    effort: "Zero tech",
    time: "Live in 24 hours",
    desc: "We generate a branded link for each agent. They share it with clients via email or text — the client gets a pre-filled quote instantly.",
    features: ["Per-agent tracking links", "Pre-fill from property address", "Client completes quote in < 5 minutes", "No development needed"],
  },
  {
    tier: "Embeddable Widget",
    effort: "One line of code",
    time: "Live in 1 week",
    desc: "Drop a quote widget into your brokerage portal or website. Clients get instant quotes without leaving your platform.",
    features: ["Branded to match your site", "Pre-fill from URL parameters", "Real-time quote results", "Conversion tracking & analytics"],
  },
  {
    tier: "Full API",
    effort: "Developer integration",
    time: "2-4 weeks",
    desc: "Deep integration into your existing systems. Quote, bind, and track policies entirely within your platform.",
    features: ["RESTful API with full documentation", "Quote, bind, endorse, renew, cancel", "Webhook notifications for status changes", "Sandbox environment for testing"],
  },
];

const MOCK_DASHBOARD = {
  partner: { name: "Apex Mortgage Group", type: "Mortgage Brokerage", since: "2025-06", tier: "Smart Link" },
  stats: {
    totalReferrals: 147, activePolicies: 118, conversionRate: 80.3,
    totalGWP: 167400, avgDaysToClose: 2.1,
    mtdReferrals: 14, mtdPolicies: 11, agentsActive: 12,
  },
  recentActivity: [
    { date: "2026-03-02", event: "Policy bound", detail: "456 Dundas St E — Standard Plan — $1,890/yr", agent: "Sarah M." },
    { date: "2026-03-01", event: "Quote generated", detail: "22 Elm St, Toronto — Awaiting client decision", agent: "James K." },
    { date: "2026-02-28", event: "Renewal processed", detail: "789 King St — Auto-renewed — $1,155/yr", agent: "Sarah M." },
    { date: "2026-02-27", event: "Policy bound", detail: "15 Maple Ave, Mississauga — Premium Plan — $3,210/yr", agent: "David R." },
    { date: "2026-02-25", event: "Quote generated", detail: "88 Front St W — Client reviewing options", agent: "James K." },
  ],
  topProperties: [
    { address: "456 Dundas St E, Toronto", premium: 1890, status: "Active", agent: "Sarah M." },
    { address: "123 Queen St W, Toronto", premium: 2340, status: "Active", agent: "James K." },
    { address: "15 Maple Ave, Mississauga", premium: 3210, status: "Active", agent: "David R." },
    { address: "789 King St, Hamilton", premium: 1155, status: "Renewal Due", agent: "Sarah M." },
    { address: "330 Bay St, Unit 2201", premium: 980, status: "Active", agent: "Priya T." },
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

// ═══ PARTNER LANDING — value-add focused ═══
function PartnerLanding({ onApply, onLogin }: { onApply: () => void; onLogin: () => void }) {
  const [expandedType, setExpandedType] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero — transaction simplification theme */}
      <section className="py-20 md:py-28 bg-card text-center">
        <div className="container max-w-3xl space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-2">
            <Zap className="w-7 h-7 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">Simplify every transaction</h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Insurance conditions slow down closings and frustrate clients. Cedar gives your team instant quoting tools that eliminate the bottleneck — so deals close faster and clients stay happy.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button onClick={onApply}
              className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors shadow-lg">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={onLogin}
              className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary px-8 py-3 rounded-xl font-semibold hover:bg-primary hover:text-primary-foreground transition-colors">
              Partner Login
            </button>
          </div>

          {/* Stats bar — value-focused, not commission-focused */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 max-w-2xl mx-auto">
            {[
              { num: "< 5 min", label: "Average quote time" },
              { num: "2 days", label: "Avg insurance condition cleared" },
              { num: "85%+", label: "Client completion rate" },
              { num: "180+", label: "Partner firms" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-extrabold text-accent">{s.num}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props — the core of the page */}
      <section className="py-20">
        <div className="container max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-2">Tools that make your team look great</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Cedar isn't just insurance — it's a closing acceleration tool for every agent in your firm.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {VALUE_PROPS.map((vp, i) => (
              <div key={i} className="rounded-2xl border-2 border-border bg-card p-7">
                <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <vp.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{vp.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{vp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — simple flow */}
      <section className="py-20 bg-card">
        <div className="container max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-2">How it works</h2>
          <p className="text-muted-foreground text-center mb-12">From sign-up to first client quote in under 24 hours.</p>
          <div className="space-y-0">
            {[
              { step: "1", title: "Sign up your brokerage", desc: "Quick application — most firms are approved within one business day." },
              { step: "2", title: "We set up your agents", desc: "Each agent gets a personalized smart link and access to the partner dashboard." },
              { step: "3", title: "Agents share links with clients", desc: "When a client needs landlord insurance, agents send their smart link — client gets a pre-filled quote in minutes." },
              { step: "4", title: "Client binds coverage instantly", desc: "Client reviews, customizes, and binds online. Proof of insurance is generated immediately for closing." },
            ].map((s, i) => (
              <div key={i} className="flex gap-5 py-6 border-b border-border last:border-0">
                <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
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
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
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
                      <p className="text-xs text-muted-foreground">Integration</p>
                      <p className="text-sm font-semibold text-foreground">{pt.integration}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onApply(); }}
                      className="w-full bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors">
                      Get Started as {pt.label}
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
          <p className="text-muted-foreground text-center mb-10">Start simple and scale up as your team grows.</p>
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
                <div className="space-y-3">
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
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Ready to simplify closings?</h2>
          <p className="text-muted-foreground leading-relaxed">Apply in 5 minutes. Most partners are live within 48 hours.</p>
          <button onClick={onApply}
            className="bg-accent text-white px-10 py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors shadow-lg">
            Get Started
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
    annualVolume: "", agentCount: "", currentInsurance: "",
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
  const isBrokerage = partnerType === "mortgage-brokerage" || partnerType === "real-estate-brokerage";

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
              "We'll set up smart links for your agents and configure your dashboard",
              "Your team starts sharing links with clients immediately",
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
          <p className="text-muted-foreground mb-6">This helps us tailor the tools and integration for your team.</p>
          <div className="flex flex-col gap-3">
            {PARTNER_TYPES.map((pt) => (
              <SelectionCard key={pt.id} selected={partnerType === pt.id}
                onClick={() => setPartnerType(pt.id)}
                label={pt.label} description={pt.desc} icon={pt.icon} />
            ))}
          </div>
          {partnerType && ptInfo && (
            <div className="mt-6 bg-accent/10 rounded-xl p-5">
              <p className="text-sm text-foreground mb-3">{ptInfo.detail}</p>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Integration</p>
                <p className="text-sm font-bold text-foreground">{ptInfo.integration}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: COMPANY */}
      {step === 1 && (
        <div>
          <h2 className="text-2xl font-extrabold text-foreground mb-1">{isBrokerage ? "Brokerage details" : "Company details"}</h2>
          <p className="text-muted-foreground mb-6">Tell us about your organization.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">{isBrokerage ? "Brokerage Name" : "Company Name"} *</label>
              <input type="text" value={company.name}
                onChange={(e) => setCompany((c: any) => ({ ...c, name: e.target.value }))}
                placeholder={isBrokerage ? "e.g. Apex Mortgage Group" : "e.g. Apex Property Management"}
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
            {partnerType === "mortgage-brokerage" && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">FSRA Brokerage License Number</label>
                <input type="text" value={company.licenseNumber}
                  onChange={(e) => setCompany((c: any) => ({ ...c, licenseNumber: e.target.value }))}
                  placeholder="e.g. M12345678"
                  className="w-full p-3 rounded-lg border-2 border-border bg-card text-foreground outline-none focus:border-accent transition-colors" />
              </div>
            )}
            {partnerType === "real-estate-brokerage" && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">RECO Brokerage Registration Number</label>
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
                  placeholder="e.g. Managing Broker"
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
          <p className="text-muted-foreground mb-6">Help us understand your volume and team size.</p>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-2">
              {partnerType === "lender" ? "Annual mortgage originations" :
               partnerType === "mortgage-brokerage" ? "Annual mortgage closings (brokerage-wide)" :
               partnerType === "real-estate-brokerage" ? "Annual investment property transactions (brokerage-wide)" :
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

          {isBrokerage && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-foreground mb-2">How many agents in your brokerage?</label>
              <div className="flex flex-col gap-2">
                {["1-5", "6-15", "16-50", "50-100", "100+"].map((v) => (
                  <SelectionCard key={v} selected={business.agentCount === v}
                    onClick={() => setBusiness((b: any) => ({ ...b, agentCount: v }))} label={v} />
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-2">How do your clients currently get landlord insurance?</label>
            <div className="flex flex-col gap-2">
              {[
                { v: "broker", l: "Through a traditional insurance broker" },
                { v: "direct", l: "Direct from an insurer" },
                { v: "unsure", l: "Not sure / varies by client" },
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
                  <p className="text-sm text-muted-foreground">Integration: {ptInfo?.integration}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border-2 border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground">{isBrokerage ? "Brokerage" : "Company"}</h3>
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
                {business.agentCount && <div><span className="text-muted-foreground">Agents:</span> <span className="font-medium">{business.agentCount}</span></div>}
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
            Generate Smart Link
          </button>
          <button onClick={onLogout}
            className="px-5 py-2.5 rounded-xl font-semibold border-2 border-border text-foreground hover:border-accent/40 transition-colors text-sm">
            Log Out
          </button>
        </div>
      </div>

      {/* KPI Cards — value-focused */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Policies", value: d.stats.activePolicies, sub: `${d.stats.mtdPolicies} bound this month`, accent: false },
          { label: "Total GWP", value: `$${d.stats.totalGWP.toLocaleString()}`, sub: `${d.stats.totalReferrals} total referrals`, accent: false },
          { label: "Avg Days to Close", value: d.stats.avgDaysToClose.toString(), sub: "Insurance condition cleared", accent: true },
          { label: "Conversion Rate", value: `${d.stats.conversionRate}%`, sub: `${d.stats.agentsActive} agents active`, accent: false },
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
                { month: "March 2026", referrals: 14, policies: 11, avgClose: "1.8 days" },
                { month: "February 2026", referrals: 22, policies: 18, avgClose: "2.1 days" },
                { month: "January 2026", referrals: 19, policies: 15, avgClose: "2.4 days" },
                { month: "December 2025", referrals: 16, policies: 13, avgClose: "1.9 days" },
                { month: "November 2025", referrals: 24, policies: 20, avgClose: "2.2 days" },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-foreground font-medium">{m.month}</span>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-muted-foreground">{m.referrals} refs</span>
                    <span className="text-muted-foreground">{m.policies} bound</span>
                    <span className="font-semibold text-accent">{m.avgClose}</span>
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
                  { label: "Generate a smart link for a client", desc: "Pre-fill with property address", action: "New Link" },
                  { label: "View agent performance", desc: "See which agents are using Cedar most", action: "View" },
                  { label: "Update brokerage information", desc: "Company details, contacts", action: "Settings" },
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
              <p className="text-sm text-accent font-semibold mb-1">Client Completion Rate</p>
              <p className="text-3xl font-extrabold text-accent">{d.stats.conversionRate}%</p>
              <p className="text-xs text-accent/60 mt-1">Of clients who receive a smart link complete their quote</p>
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
                  a.event === "Renewal processed" ? "bg-blue-100 text-blue-700" : "bg-muted/50 text-muted-foreground"
                }`}>
                  {a.event === "Policy bound" ? "✓" :
                   a.event === "Renewal processed" ? "↻" : "→"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{a.event}</p>
                    <span className="text-xs text-muted-foreground">{a.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{a.detail}</p>
                  <p className="text-xs text-accent mt-1">Agent: {a.agent}</p>
                </div>
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
                <th className="text-left text-xs font-semibold text-muted-foreground py-3">Agent</th>
                <th className="text-left text-xs font-semibold text-muted-foreground py-3">Status</th>
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
                    <p className="text-sm text-muted-foreground">{p.agent}</p>
                  </td>
                  <td className="py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      p.status === "Active" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                    }`}>{p.status}</span>
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
