// File: src/pages/LandlordsPage.tsx
// Cedar Insurance - Landlords: Landing + Quick Estimate Calculator

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ═══ QUICK ESTIMATE ENGINE ═══

function estimatePremium(inputs: {
  propertyType: string; units: number; replacementCost: number; yearBuilt: number;
}) {
  const { propertyType, units, replacementCost, yearBuilt } = inputs;
  let base = replacementCost * 0.0035;
  const um: Record<number, number> = { 1: 1, 2: 1.35, 3: 1.6, 4: 1.85 };
  base *= um[Math.min(units, 4)] || 2.1;
  const age = 2026 - yearBuilt;
  if (age > 50) base *= 1.25;
  else if (age > 30) base *= 1.12;
  else if (age < 5) base *= 0.92;
  if (propertyType === "condo") base *= 0.75;
  if (propertyType === "multi") base *= 1.1;
  const low = Math.round(base * 0.85);
  const high = Math.round(base * 1.2);
  const mid = Math.round(base);
  return { low, mid, high };
}

const PROPERTY_TYPES = [
  { value: "detached", label: "Detached" },
  { value: "semi", label: "Semi-Detached" },
  { value: "townhouse", label: "Townhouse / Row" },
  { value: "multi", label: "Multi-Unit (2-6)" },
  { value: "condo", label: "Condo Unit" },
  { value: "duplex", label: "Duplex" },
];

const COVERAGE_FEATURES = [
  {
    title: "Dwelling Protection",
    desc: "Full replacement cost coverage for your rental property — structure, fixtures, and permanently installed equipment.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    title: "Loss of Rental Income",
    desc: "Up to 24 months of rental income replacement if your property becomes uninhabitable due to a covered loss.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: "Liability Coverage",
    desc: "Up to $5M in liability protection if a tenant or visitor is injured on your property. Includes legal defense costs.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Sewer & Water Backup",
    desc: "Coverage for damage caused by sewer backup, sump pump failure, or overland water — one of the most common claims for landlords.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    ),
  },
  {
    title: "Equipment Breakdown",
    desc: "Covers mechanical and electrical breakdown of HVAC, boilers, water heaters, and other building systems.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    title: "Legal Expense Coverage",
    desc: "Covers legal costs related to tenant disputes, eviction proceedings, and lease enforcement actions.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
];

const FAQ_ITEMS = [
  {
    q: "Do I need landlord insurance if I already have homeowner's insurance?",
    a: "Yes. Standard homeowner's policies exclude properties used as rentals. Once you have a tenant, your homeowner's policy likely won't cover claims — and your insurer could void coverage entirely. Landlord insurance is specifically designed for rental properties.",
  },
  {
    q: "What's the difference between landlord insurance and tenant insurance?",
    a: "Landlord insurance covers the building structure, your liability as owner, and loss of rental income. Tenant insurance covers the tenant's personal belongings and their personal liability. Both should be in place — we offer both.",
  },
  {
    q: "Does this cover short-term rentals (Airbnb, VRBO)?",
    a: "We can provide coverage for properties with short-term rental use, though there is a premium adjustment to reflect the higher risk. Flag it during your quote so we can provide accurate pricing.",
  },
  {
    q: "How quickly can I get coverage?",
    a: "Same-day. Complete the quote flow, bind online, and receive your certificate of insurance within minutes. Full policy documents follow within 1-2 business days.",
  },
  {
    q: "What if I own multiple rental properties?",
    a: "We can quote your entire portfolio. Multi-property owners typically see volume discounts starting at 3+ properties. Each property gets its own policy with individual coverage limits.",
  },
  {
    q: "Can my mortgage lender see proof of insurance instantly?",
    a: "Yes. We generate certificates of insurance on demand. Many of our lender partners receive proof automatically through our system — no phone calls or faxes required.",
  },
];

// ═══ QUICK ESTIMATE CALCULATOR ═══
function QuickEstimate({ onGetQuote }: { onGetQuote: () => void }) {
  const [inputs, setInputs] = useState({
    propertyType: "",
    units: 1,
    replacementCost: "",
    yearBuilt: "",
  });
  const [result, setResult] = useState<{ low: number; mid: number; high: number } | null>(null);
  const [animating, setAnimating] = useState(false);

  const update = (key: string, val: any) => setInputs((p) => ({ ...p, [key]: val }));
  const canEstimate = inputs.propertyType && inputs.replacementCost && inputs.yearBuilt;

  const calculate = useCallback(() => {
    if (!canEstimate) return;
    setAnimating(true);
    setResult(null);
    setTimeout(() => {
      const est = estimatePremium({
        propertyType: inputs.propertyType,
        units: inputs.units,
        replacementCost: parseInt(inputs.replacementCost as string) || 400000,
        yearBuilt: parseInt(inputs.yearBuilt as string) || 1990,
      });
      setResult(est);
      setAnimating(false);
    }, 800);
  }, [canEstimate, inputs]);

  return (
    <div className="bg-card border-2 border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-accent/5 px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
              <rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" />
              <line x1="8" y1="10" x2="16" y2="10" /><line x1="8" y1="14" x2="12" y2="14" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-foreground">Insurance Estimate</h3>
            <p className="text-xs text-muted-foreground">4 questions. 10 seconds. Ballpark premium.</p>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="p-6 space-y-5">
        {/* Property type */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Property type</label>
          <div className="grid grid-cols-3 gap-2">
            {PROPERTY_TYPES.map((pt) => (
              <button key={pt.value} onClick={() => update("propertyType", pt.value)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all text-center ${
                  inputs.propertyType === pt.value
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-background text-foreground hover:border-accent/30"
                }`}>
                {pt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Units */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Number of rental units</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((n) => (
              <button key={n} onClick={() => update("units", n)}
                className={`flex-1 p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                  inputs.units === n
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-foreground hover:border-accent/30"
                }`}>
                {n}{n === 4 ? "+" : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Replacement cost */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Estimated replacement cost</label>
          <p className="text-xs text-muted-foreground mb-2">What it would cost to rebuild — typically 50-70% of market value.</p>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</div>
            <input type="text" value={inputs.replacementCost ? parseInt(inputs.replacementCost as string).toLocaleString() : ""}
              onChange={(e) => update("replacementCost", e.target.value.replace(/,/g, ""))}
              placeholder="e.g. 400,000"
              className="w-full pl-8 pr-4 py-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent transition-colors" />
          </div>
          <div className="flex gap-2 mt-2">
            {[250000, 400000, 600000, 800000].map((v) => (
              <button key={v} onClick={() => update("replacementCost", String(v))}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  inputs.replacementCost === String(v)
                    ? "border-accent bg-accent/10 text-accent font-semibold"
                    : "border-border text-muted-foreground hover:border-accent/30"
                }`}>
                ${(v / 1000)}K
              </button>
            ))}
          </div>
        </div>

        {/* Year built */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Year built</label>
          <input type="number" value={inputs.yearBuilt}
            onChange={(e) => update("yearBuilt", e.target.value)}
            placeholder="e.g. 1985"
            className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent transition-colors" />
          <div className="flex gap-2 mt-2">
            {[1960, 1980, 2000, 2015].map((y) => (
              <button key={y} onClick={() => update("yearBuilt", String(y))}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  inputs.yearBuilt === String(y)
                    ? "border-accent bg-accent/10 text-accent font-semibold"
                    : "border-border text-muted-foreground hover:border-accent/30"
                }`}>
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* Calculate button */}
        <button onClick={calculate} disabled={!canEstimate}
          className="w-full bg-accent text-accent-foreground py-4 rounded-xl font-semibold hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {animating ? (
            <>
              <div className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              Get Estimate
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="border-t-2 border-border bg-accent/5 p-6">
          <p className="text-sm text-muted-foreground mb-3 text-center">Your estimated premium</p>
          <div className="text-center mb-4">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-extrabold text-accent">
                ${Math.round(result.mid / 12).toLocaleString()}/mo
              </span>
            </div>
            <div className="flex items-baseline justify-center gap-1 mt-2">
              <span className="text-sm text-muted-foreground">
                ${result.low.toLocaleString()} – ${result.high.toLocaleString()}/year
              </span>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 mb-4">
            <p className="text-xs text-muted-foreground text-center">
              This is a rough estimate based on limited inputs. Your actual premium depends on construction type, heating, claims history, occupancy, and other factors. Get a full quote for exact pricing.
            </p>
          </div>
          <button onClick={onGetQuote}
            className="w-full bg-accent text-accent-foreground py-4 rounded-xl font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2">
            Get Your Exact Quote
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          <p className="text-xs text-muted-foreground text-center mt-2">Takes about 60 seconds — we auto-fill most of the details.</p>
        </div>
      )}
    </div>
  );
}

// ═══ FAQ ACCORDION ═══
function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i}
          className="bg-card border-2 border-border rounded-xl overflow-hidden transition-all hover:border-accent/20">
          <button onClick={() => setOpen(open === i ? null : i)}
            className="w-full text-left px-5 py-4 flex items-center justify-between">
            <span className="font-semibold text-foreground text-sm pr-4">{item.q}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              className={`flex-shrink-0 transition-transform text-muted-foreground ${open === i ? "rotate-180" : ""}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {open === i && (
            <div className="px-5 pb-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ═══ MAIN LANDLORDS PAGE ═══
export default function LandlordsPage() {
  const navigate = useNavigate();

  const handleGetQuote = useCallback(() => {
    navigate("/quote");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      {/* ═══ HERO + ESTIMATOR ═══ */}
      <section className="max-w-6xl mx-auto px-5 py-16" data-section="estimator">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left - Copy */}
          <div className="pt-4">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              For Ontario Landlords
            </div>
            <h1 className="text-5xl font-extrabold text-foreground leading-tight mb-5">
              Insurance that
              <br /><span className="text-accent italic">actually</span> understands
              <br />rental property.
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Built specifically for landlords — not retrofitted from a homeowner's policy.
              Get coverage that protects your rental income, your building, and your liability
              with rates that reflect how well you manage your properties.
            </p>

            {/* Value props */}
            <div className="space-y-4 mb-8">
              {[
                { bold: "Instant quotes.", rest: "We pull property data automatically — answer a few questions and get pricing in under 60 seconds." },
                { bold: "Same-day coverage.", rest: "Bind online and receive your certificate of insurance immediately. No waiting for broker callbacks." },
                { bold: "Built for multi-unit.", rest: "Whether you own one duplex or forty units, our platform handles portfolio coverage without the spreadsheet gymnastics." },
              ].map((vp, i) => (
                <div key={i} className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" fill="hsl(var(--accent))" />
                    <polyline points="16 8 10 14 8 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-sm text-foreground">
                    <strong>{vp.bold}</strong> {vp.rest}
                  </p>
                </div>
              ))}
            </div>

            {/* Trust bar */}
            <div className="flex gap-8">
              {[
                { num: "60 sec", label: "Average quote time" },
                { num: "A-rated", label: "Carrier partners" },
                { num: "$0", label: "To get a quote" },
              ].map((s, i) => (
                <div key={i}>
                  <p className="text-xl font-extrabold text-accent">{s.num}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Quick Estimate */}
          <QuickEstimate onGetQuote={handleGetQuote} />
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="bg-accent/5 border-y border-border">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-foreground mb-2">How it works</h2>
            <p className="text-muted-foreground">From quote to covered in three steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Enter your address",
                desc: "We pull property details from MPAC and municipal records automatically. You just confirm what we found and answer a few questions about your rental.",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                ),
              },
              {
                step: "2",
                title: "Compare coverage options",
                desc: "Get three transparent coverage tiers — Basic, Standard, and Premium. See exactly what's included at each level with no hidden fees or fine print games.",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                ),
              },
              {
                step: "3",
                title: "Bind and get covered",
                desc: "Select your plan, pay online, and receive your binder and certificate of insurance instantly. Full policy documents delivered within 1-2 business days.",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ),
              },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-card border-2 border-border flex items-center justify-center mx-auto mb-4 shadow-sm">
                  {s.icon}
                </div>
                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent text-accent-foreground text-xs font-bold mb-3">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COVERAGE GRID ═══ */}
      <section className="max-w-5xl mx-auto px-5 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-foreground mb-2">Coverage built for landlords</h2>
          <p className="text-muted-foreground">Everything you need. Nothing you don't.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {COVERAGE_FEATURES.map((cf, i) => (
            <div key={i} className="bg-card border-2 border-border rounded-2xl p-6 hover:border-accent/30 hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                {cf.icon}
              </div>
              <h3 className="font-bold text-foreground mb-2">{cf.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{cf.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ COMPARISON ═══ */}
      <section className="bg-accent/5 border-y border-border">
        <div className="max-w-4xl mx-auto px-5 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-foreground mb-2">Cedar vs. the traditional way</h2>
            <p className="text-muted-foreground">Why landlords are switching.</p>
          </div>
          <div className="bg-card border-2 border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left text-sm font-semibold text-muted-foreground p-4 w-2/5"></th>
                    <th className="text-center text-sm font-bold text-accent p-4 bg-accent/5">Cedar</th>
                    <th className="text-center text-sm font-semibold text-muted-foreground p-4">Traditional Broker</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Time to quote", cedar: "Under 60 seconds", trad: "1-3 business days" },
                    { feature: "Bind coverage", cedar: "Instant, online", trad: "Requires phone/email confirmation" },
                    { feature: "Certificate of insurance", cedar: "Immediate download", trad: "Request and wait" },
                    { feature: "Property data entry", cedar: "Auto-populated", trad: "Fill out a 4-page application" },
                    { feature: "Portfolio management", cedar: "Single dashboard", trad: "Separate policies, separate brokers" },
                    { feature: "Renewal", cedar: "Auto-renew with 60-day notice", trad: "Manual process each year" },
                    { feature: "Claims reporting", cedar: "Online, 24/7", trad: "Phone during business hours" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="p-4 text-sm font-medium text-foreground">{row.feature}</td>
                      <td className="p-4 text-sm text-center text-accent font-medium bg-accent/5">{row.cedar}</td>
                      <td className="p-4 text-sm text-center text-muted-foreground">{row.trad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="max-w-3xl mx-auto px-5 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-foreground mb-2">Common questions</h2>
          <p className="text-muted-foreground">Everything landlords ask us.</p>
        </div>
        <FAQSection />
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      <section className="max-w-5xl mx-auto px-5 pb-16">
        <div className="bg-primary rounded-2xl p-12 md:p-16 text-center text-primary-foreground">
          <h2 className="text-3xl md:text-4xl mb-4">Ready to protect your investment?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Join hundreds of Ontario landlords who switched to smarter, faster coverage.
            Get a quote in 60 seconds — no commitment, no phone calls.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={handleGetQuote}
              className="bg-secondary text-secondary-foreground px-8 py-4 rounded-xl font-bold hover:bg-secondary/90 transition-colors">
              Get a Quote
            </button>
            <button onClick={() => {
              const el = document.querySelector('[data-section="estimator"]');
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
              className="border-2 border-primary-foreground/30 text-primary-foreground px-8 py-4 rounded-xl font-bold hover:bg-primary-foreground/10 transition-colors">
              Try the Estimator
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
