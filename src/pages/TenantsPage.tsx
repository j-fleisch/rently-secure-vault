import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ═══ TENANT ESTIMATE ENGINE ═══
function estimatePremium(inputs: {
  unitType: string; contentsValue: number; liabilityLimit: string; hasHighValue: boolean;
}) {
  const { unitType, contentsValue, liabilityLimit, hasHighValue } = inputs;
  let base = contentsValue * 0.012;
  const typeMultiplier: Record<string, number> = {
    apartment: 1.0, condo: 0.95, basement: 1.15, house: 1.05, townhouse: 1.0, room: 0.85,
  };
  base *= typeMultiplier[unitType] || 1.0;
  const liabilityAdd: Record<string, number> = {
    "1000000": 0, "2000000": 35, "3000000": 65,
  };
  base += liabilityAdd[liabilityLimit] || 0;
  if (hasHighValue) base *= 1.15;
  base = Math.max(base, 180);
  const annual = Math.round(base);
  const low = Math.round(annual * 0.85);
  const high = Math.round(annual * 1.15);
  return { low, mid: annual, high };
}

const UNIT_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "condo", label: "Condo" },
  { value: "basement", label: "Basement Unit" },
  { value: "house", label: "House Rental" },
  { value: "townhouse", label: "Townhouse" },
  { value: "room", label: "Room / Shared" },
];

const CONTENTS_PRESETS = [
  { value: 15000, label: "$15K" },
  { value: 30000, label: "$30K" },
  { value: 50000, label: "$50K" },
  { value: 75000, label: "$75K" },
];

const COVERAGE_FEATURES = [
  {
    title: "Contents Protection",
    desc: "Covers your personal belongings — furniture, electronics, clothing, kitchenware — against theft, fire, water damage, and other covered perils.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><polyline points="16 3 12 7 8 3" />
      </svg>
    ),
  },
  {
    title: "Liability Coverage",
    desc: "Up to $3M in protection if someone is injured in your rental unit or if you accidentally damage the building. Includes legal defense costs.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Additional Living Expenses",
    desc: "If your unit becomes uninhabitable due to a covered loss, we cover hotel stays, meals, and other temporary living costs while repairs are completed.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    title: "Sewer & Water Backup",
    desc: "Covers damage to your belongings from sewer backup or water infiltration — especially important for basement and ground-floor units.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    ),
  },
  {
    title: "Identity Theft Protection",
    desc: "Coverage for expenses related to restoring your identity, including legal fees, lost wages, and credit monitoring after a breach.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: "Visitor Medical Payments",
    desc: "Covers medical expenses for guests who are injured in your rental unit, regardless of fault — avoids the hassle of a liability claim for minor incidents.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
];

const FAQ_ITEMS = [
  {
    q: "My landlord has insurance — do I still need my own?",
    a: "Yes. Your landlord's policy covers the building structure and their liability, not your stuff. If there's a fire or theft, your furniture, electronics, clothing — all of it — is not covered unless you have tenant insurance. Landlord insurance also doesn't cover your liability if you accidentally cause damage to the building.",
  },
  {
    q: "Does my lease require tenant insurance?",
    a: "Many Ontario landlords now require proof of tenant insurance as a condition of the lease, typically with a minimum of $1M in liability coverage. Even if it's not required, it's one of the most affordable types of insurance you can buy.",
  },
  {
    q: "How much does tenant insurance actually cost?",
    a: "Most tenants pay between $20 and $45 per month depending on the value of their belongings and coverage limits. That's less than a streaming subscription for protection against thousands of dollars in potential losses.",
  },
  {
    q: "What counts as 'contents' — what's actually covered?",
    a: "Everything you'd take with you if you moved: furniture, electronics, clothing, appliances, kitchen items, sports equipment, books, artwork. High-value items like jewelry, collectibles, or musical instruments over a certain threshold may need a scheduled rider for full coverage.",
  },
  {
    q: "Does tenant insurance cover my roommate?",
    a: "Not automatically. Each person on the lease should have their own policy unless you specifically add a roommate to yours. Sharing a policy with a non-family roommate can create complications at claim time.",
  },
  {
    q: "What if I accidentally damage the apartment — like a kitchen fire or overflowing bathtub?",
    a: "That's exactly what the liability portion covers. If you accidentally cause damage to the building or another tenant's unit, your liability coverage pays for the repairs and any resulting claims against you.",
  },
];

// ═══ HELPERS ═══
function formatNumber(val: string): string {
  const num = val.replace(/[^0-9]/g, "");
  if (!num) return "";
  return parseInt(num).toLocaleString();
}
function parseNumber(val: string): string {
  return val.replace(/[^0-9]/g, "");
}

// ═══ INSURANCE ESTIMATE CALCULATOR ═══
function InsuranceEstimate({ onGetQuote }: { onGetQuote: () => void }) {
  const [inputs, setInputs] = useState({
    unitType: "",
    contentsValue: "",
    contentsDisplay: "",
    liabilityLimit: "1000000",
    hasHighValue: false,
  });
  const [result, setResult] = useState<{ low: number; mid: number; high: number } | null>(null);
  const [animating, setAnimating] = useState(false);

  const update = (key: string, val: any) => setInputs((p) => ({ ...p, [key]: val }));

  const handleContentsChange = (raw: string) => {
    const cleaned = parseNumber(raw);
    setInputs((p) => ({ ...p, contentsValue: cleaned, contentsDisplay: formatNumber(cleaned) }));
  };

  const handleContentsPreset = (val: number) => {
    setInputs((p) => ({ ...p, contentsValue: String(val), contentsDisplay: val.toLocaleString() }));
  };

  const canEstimate = inputs.unitType && inputs.contentsValue;

  const calculate = useCallback(() => {
    if (!canEstimate) return;
    setAnimating(true);
    setResult(null);
    setTimeout(() => {
      const est = estimatePremium({
        unitType: inputs.unitType,
        contentsValue: parseInt(inputs.contentsValue) || 30000,
        liabilityLimit: inputs.liabilityLimit,
        hasHighValue: inputs.hasHighValue,
      });
      setResult(est);
      setAnimating(false);
    }, 800);
  }, [canEstimate, inputs]);

  return (
    <div className="bg-card border-2 border-border rounded-2xl overflow-hidden">
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
            <p className="text-xs text-muted-foreground">4 questions. 10 seconds. See your estimated cost.</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Unit type */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">What type of unit do you rent?</label>
          <div className="grid grid-cols-3 gap-2">
            {UNIT_TYPES.map((ut) => (
              <button key={ut.value} onClick={() => update("unitType", ut.value)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all text-center ${
                  inputs.unitType === ut.value
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-background text-foreground hover:border-accent/30"
                }`}>
                {ut.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contents value */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Estimated value of your belongings</label>
          <p className="text-xs text-muted-foreground mb-2">Think: furniture, electronics, clothing, kitchenware — everything you own in your unit.</p>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</div>
            <input type="text" value={inputs.contentsDisplay}
              onChange={(e) => handleContentsChange(e.target.value)}
              placeholder="e.g. 30,000"
              className="w-full pl-8 pr-4 py-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent transition-colors" />
          </div>
          <div className="flex gap-2 mt-2">
            {CONTENTS_PRESETS.map((p) => (
              <button key={p.value} onClick={() => handleContentsPreset(p.value)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  inputs.contentsValue === String(p.value)
                    ? "border-accent bg-accent/10 text-accent font-semibold"
                    : "border-border text-muted-foreground hover:border-accent/30"
                }`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Liability limit */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Liability coverage</label>
          <div className="flex gap-2">
            {[
              { value: "1000000", label: "$1M" },
              { value: "2000000", label: "$2M" },
              { value: "3000000", label: "$3M" },
            ].map((l) => (
              <button key={l.value} onClick={() => update("liabilityLimit", l.value)}
                className={`flex-1 p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                  inputs.liabilityLimit === l.value
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-foreground hover:border-accent/30"
                }`}>
                {l.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">Most landlords require at least $1M. $2M is recommended.</p>
        </div>

        {/* High-value items */}
        <div>
          <button onClick={() => update("hasHighValue", !inputs.hasHighValue)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center justify-between ${
              inputs.hasHighValue ? "border-accent bg-accent/10" : "border-border hover:border-accent/30"
            }`}>
            <div>
              <p className="text-sm font-semibold text-foreground">I have high-value items</p>
              <p className="text-xs text-muted-foreground mt-0.5">Jewelry, art, collectibles, instruments, or electronics over $2,500 each</p>
            </div>
            <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
              inputs.hasHighValue ? "border-accent bg-accent" : "border-muted-foreground/30"
            }`}>
              {inputs.hasHighValue && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          </button>
        </div>

        {/* Calculate */}
        <button onClick={calculate} disabled={!canEstimate}
          className="w-full bg-accent text-white py-4 rounded-xl font-semibold hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {animating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
          <div className="text-center mb-1">
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
          <div className="bg-card border border-border rounded-lg p-3 mb-4 mt-4">
            <p className="text-xs text-muted-foreground text-center">
              This is a rough estimate. Your actual premium depends on your specific location, building type, claims history, and deductible selection. Get a full quote for exact pricing.
            </p>
          </div>
          <button onClick={onGetQuote}
            className="w-full bg-accent text-white py-4 rounded-xl font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2">
            Get Your Exact Quote
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          <p className="text-xs text-muted-foreground text-center mt-2">Takes about 60 seconds — no commitment required.</p>
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
        <div key={i} className="bg-card border-2 border-border rounded-xl overflow-hidden transition-all hover:border-accent/20">
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

// ═══ CONTENTS GUIDE ═══
function ContentsGuide() {
  const [open, setOpen] = useState(false);
  const categories = [
    { cat: "Living Room", items: "Couch, TV, speakers, gaming console, coffee table, bookshelf, decor", avg: "$4,000 – $8,000" },
    { cat: "Bedroom", items: "Bed frame, mattress, dresser, nightstands, clothing, shoes", avg: "$3,000 – $7,000" },
    { cat: "Kitchen", items: "Small appliances, cookware, dishes, utensils, pantry items", avg: "$1,500 – $3,000" },
    { cat: "Electronics", items: "Laptop, phone, tablet, headphones, camera, chargers", avg: "$2,000 – $5,000" },
    { cat: "Bathroom", items: "Toiletries, towels, hair tools, grooming supplies", avg: "$500 – $1,000" },
    { cat: "Other", items: "Sports gear, musical instruments, tools, seasonal items, bikes", avg: "$1,000 – $5,000" },
  ];

  return (
    <div className="bg-card border-2 border-border rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-accent/5 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Not sure what your stuff is worth?</p>
            <p className="text-xs text-muted-foreground">Use our room-by-room guide to estimate.</p>
          </div>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className={`transition-transform text-muted-foreground ${open ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-5 border-t border-border pt-4">
          <div className="space-y-3">
            {categories.map((c, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.cat}</p>
                  <p className="text-xs text-muted-foreground">{c.items}</p>
                </div>
                <span className="text-sm font-semibold text-accent whitespace-nowrap ml-4">{c.avg}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-accent/10 rounded-lg p-3">
            <p className="text-xs text-accent font-medium">
              Typical total for a 1-bedroom: $15,000 – $30,000. For a 2-bedroom: $25,000 – $50,000. When in doubt, round up — underinsuring is the most common mistake tenants make.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══ MAIN TENANTS PAGE ═══
export default function TenantsPage() {
  const handleGetQuote = useCallback(() => {
    window.location.href = "/quote";
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      {/* ═══ HERO + ESTIMATOR ═══ */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="pt-4">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              For Ontario Tenants
            </div>
            <h1 className="text-5xl font-extrabold text-foreground leading-tight mb-5">
              Your landlord's
              <br />insurance <span className="text-accent italic">doesn't</span>
              <br />cover your stuff.
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              If there's a fire, flood, or break-in, your landlord's policy covers the building — not
              a single thing inside your unit. Tenant insurance protects your belongings, covers your
              liability, and costs less than you think.
            </p>
            <div className="space-y-4 mb-8">
              {[
                { bold: "Starts under $20/month.", rest: "Less than a streaming subscription. Covers tens of thousands in belongings and up to $3M in liability." },
                { bold: "Meets your lease requirement.", rest: "Most Ontario landlords now require proof of tenant insurance. Get your certificate instantly after binding." },
                { bold: "Covers more than you'd expect.", rest: "Theft, fire, water damage, liability if someone's hurt in your unit, temporary living expenses if you're displaced, and more." },
              ].map((vp, i) => (
                <div key={i} className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" className="fill-accent" />
                    <polyline points="16 8 10 14 8 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-sm text-foreground">
                    <strong>{vp.bold}</strong> {vp.rest}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex gap-8">
              {[
                { num: "< $20", label: "Per month for most" },
                { num: "60 sec", label: "To get a quote" },
                { num: "Instant", label: "Certificate delivery" },
              ].map((s, i) => (
                <div key={i}>
                  <p className="text-xl font-extrabold text-accent">{s.num}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <InsuranceEstimate onGetQuote={handleGetQuote} />
        </div>
      </section>

      {/* ═══ CONTENTS GUIDE ═══ */}
      <section className="max-w-3xl mx-auto px-5 pb-8">
        <ContentsGuide />
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="bg-accent/5 border-y border-border">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-foreground mb-2">How it works</h2>
            <p className="text-muted-foreground">Three steps. Under two minutes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1", title: "Tell us about your unit",
                desc: "Answer a few quick questions about where you live, the value of your belongings, and what coverage you need. No paperwork, no jargon.",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                ),
              },
              {
                step: "2", title: "See your price instantly",
                desc: "Get a clear, transparent quote with no hidden fees. Choose your deductible and coverage limits. Compare options side by side.",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
                    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                ),
              },
              {
                step: "3", title: "Get covered immediately",
                desc: "Pay online and receive your certificate of insurance in minutes. Send it to your landlord directly from the platform — done.",
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
                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent text-white text-xs font-bold mb-3">
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
          <h2 className="text-3xl font-extrabold text-foreground mb-2">What tenant insurance covers</h2>
          <p className="text-muted-foreground">More protection than you'd expect for less than you'd think.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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

      {/* ═══ REAL SCENARIOS ═══ */}
      <section className="bg-accent/5 border-y border-border">
        <div className="max-w-4xl mx-auto px-5 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-foreground mb-2">Real scenarios, real coverage</h2>
            <p className="text-muted-foreground">Here's what tenant insurance looks like when you actually need it.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                scenario: "Kitchen fire damages your unit", cost: "$12,000+",
                without: "You're out thousands for a hotel, new furniture, clothing, and kitchen essentials. The landlord's insurance only covers the building repairs.",
                with: "Your policy covers temporary housing, replaces your damaged belongings, and pays for any liability if the fire spread to neighboring units.",
              },
              {
                scenario: "Laptop stolen from your apartment", cost: "$1,500+",
                without: "You eat the full replacement cost — police report filed, but nothing else you can do. Renters feel the loss directly.",
                with: "File a claim, provide proof of purchase, and get reimbursed for the replacement value minus your deductible.",
              },
              {
                scenario: "Your bathtub overflows into the unit below", cost: "$5,000+",
                without: "Your downstairs neighbor and your landlord both come after you for the damage. You're personally liable for thousands in repairs.",
                with: "Your liability coverage handles the repair costs for the neighbor's unit and protects you from out-of-pocket legal expenses.",
              },
              {
                scenario: "Sewer backs up into your basement unit", cost: "$8,000+",
                without: "Your furniture, electronics, and clothing are ruined. Landlord's insurance doesn't cover your personal property. Full loss.",
                with: "Sewer backup coverage reimburses you for damaged belongings and covers additional living expenses while your unit is cleaned and restored.",
              },
            ].map((s, i) => (
              <div key={i} className="bg-card border-2 border-border rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-1">{s.scenario}</h3>
                <span className="inline-block text-xs font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full mb-3">
                  Potential loss: {s.cost}
                </span>
                <div className="space-y-3 mt-2">
                  <div>
                    <p className="text-xs font-semibold text-destructive mb-1">Without tenant insurance:</p>
                    <p className="text-sm text-muted-foreground">{s.without}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-accent mb-1">With Cedar:</p>
                    <p className="text-sm text-foreground">{s.with}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="max-w-3xl mx-auto px-5 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-foreground mb-2">Common questions</h2>
          <p className="text-muted-foreground">Everything tenants ask us.</p>
        </div>
        <FAQSection />
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      <section className="max-w-5xl mx-auto px-5 pb-16">
        <div className="bg-accent rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-extrabold mb-3">Protect your stuff. Not your landlord's building.</h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            Tenant insurance starts under $20/month. Get a quote in 60 seconds and send your certificate to your landlord today.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={handleGetQuote}
              className="bg-white text-accent px-8 py-4 rounded-xl font-bold hover:bg-white/90 transition-colors">
              Get a Quote
            </button>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="bg-white/10 text-white border-2 border-white/20 px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-colors">
              Try the Estimator
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}