import { useState } from "react";

// ═══════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════

const POLICY = {
  id: "CED-2025-T-008214",
  address: "45 Charles St E, Unit 1204, Toronto, ON M4Y 1S2",
  plan: "Standard",
  status: "Active",
  effectiveDate: "2025-09-01",
  expiryDate: "2026-09-01",
  premium: 396,
  paymentFrequency: "Monthly",
  nextPayment: "2026-03-15",
  nextPaymentAmount: 33,
  unitType: "Apartment",
  building: "The Charles Residences",
  landlord: {
    name: "Greenfield Property Management",
    email: "admin@greenfieldpm.ca",
    phone: "(416) 555-0900",
  },
  coverages: [
    { name: "Contents", limit: 40000, deductible: 500, detail: "Replacement cost basis" },
    { name: "Liability", limit: 2000000, deductible: 0, detail: "Personal liability" },
    { name: "Additional Living Expenses", limit: 12000, deductible: 0, detail: "If your unit becomes uninhabitable" },
    { name: "Sewer & Water Backup", limit: 10000, deductible: 500, detail: "Water damage from backup" },
    { name: "Visitor Medical Payments", limit: 5000, deductible: 0, detail: "Guest injury coverage" },
  ],
  additionalInsureds: [
    { name: "Greenfield Property Management", type: "Landlord / Property Manager", added: "2025-09-01" },
  ],
  documents: [
    { name: "Policy Declaration", type: "declaration", date: "2025-09-01", size: "128 KB" },
    { name: "Full Policy Wording", type: "policy", date: "2025-09-01", size: "980 KB" },
    { name: "Certificate of Insurance", type: "certificate", date: "2025-09-01", size: "82 KB" },
  ],
  receipts: [
    { name: "Payment Receipt — Feb 2026", date: "2026-02-15", size: "34 KB" },
    { name: "Payment Receipt — Jan 2026", date: "2026-01-15", size: "34 KB" },
    { name: "Payment Receipt — Dec 2025", date: "2025-12-15", size: "34 KB" },
  ],
  roommates: [
    { name: "Anil Kapoor", relationship: "Roommate", added: "2025-09-01" },
  ],
};

const INITIAL_INVENTORY = [
  {
    id: "living-room", name: "Living Room", items: [
      { name: "Sectional Sofa", value: 2200, year: 2024 },
      { name: "Samsung 55\" TV", value: 900, year: 2024 },
      { name: "Coffee Table", value: 350, year: 2023 },
      { name: "Floor Lamp + Bookshelf", value: 400, year: 2022 },
    ],
  },
  {
    id: "bedroom", name: "Bedroom", items: [
      { name: "Queen Bed Frame + Mattress", value: 1800, year: 2023 },
      { name: "Dresser + Nightstands", value: 650, year: 2023 },
      { name: "Clothing & Shoes", value: 3500, year: null },
    ],
  },
  {
    id: "kitchen", name: "Kitchen", items: [
      { name: "KitchenAid Stand Mixer", value: 450, year: 2024 },
      { name: "Cookware Set", value: 300, year: 2023 },
      { name: "Small Appliances", value: 400, year: null },
    ],
  },
  {
    id: "electronics", name: "Electronics / Office", items: [
      { name: "MacBook Pro 14\"", value: 2800, year: 2024 },
      { name: "iPad Air", value: 750, year: 2024 },
      { name: "Sony WH-1000XM5 Headphones", value: 400, year: 2024 },
      { name: "Monitor + Desk Setup", value: 900, year: 2023 },
    ],
  },
  {
    id: "other", name: "Other", items: [
      { name: "Mountain Bike", value: 1200, year: 2022 },
      { name: "Ski Equipment", value: 800, year: 2021 },
      { name: "Luggage Set", value: 350, year: 2023 },
    ],
  },
];

const AVAILABLE_ADDONS = [
  { id: "identity", name: "Identity Theft Protection", desc: "Covers expenses to restore identity including legal fees and lost wages", startingAt: 35 },
  { id: "earthquake", name: "Earthquake Coverage", desc: "Coverage for damage caused by earthquakes", startingAt: 25 },
  { id: "highvalue", name: "Scheduled High-Value Items", desc: "Individual coverage for jewelry, art, instruments, or electronics over $2,500", startingAt: 50 },
  { id: "cyber", name: "Cyber Protection", desc: "Coverage for online fraud, cyberbullying, and data breach expenses", startingAt: 30 },
  { id: "storage", name: "Off-Premises Storage", desc: "Extends contents coverage to items in a storage locker or unit", startingAt: 20 },
];

const REFERRAL = {
  code: "PRIYA50",
  link: "https://cedarinsurance.ca/r/PRIYA50",
  reward: 50,
  balance: 50,
  totalEarned: 100,
  referrals: [
    { name: "Meera Patel", status: "Bound", date: "2026-01-20", reward: 50, policyType: "Tenant" },
    { name: "Raj Sharma", status: "Bound", date: "2025-11-10", reward: 50, policyType: "Tenant" },
    { name: "Tina Nguyen", status: "Quoted", date: "2026-02-25", reward: null, policyType: "Tenant" },
    { name: "Alex Kim", status: "Expired", date: "2025-10-01", reward: null, policyType: "Landlord" },
  ],
};

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = {
    Active: "bg-green-100 text-green-800",
    "Renewal Due": "bg-amber-100 text-amber-800",
    Bound: "bg-green-100 text-green-800",
    Quoted: "bg-blue-100 text-blue-800",
    Expired: "bg-red-100 text-red-800",
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s[status] || "bg-muted text-muted-foreground"}`}>{status}</span>;
}

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - new Date("2026-03-05").getTime()) / 86400000);
}

// ═══════════════════════════════════════════════════
// SHARE CERTIFICATE MODAL
// ═══════════════════════════════════════════════════

function ShareCertificateModal({ onClose }: { onClose: () => void }) {
  const [method, setMethod] = useState<"email" | "download">("email");
  const [recipientName, setRecipientName] = useState(POLICY.landlord.name);
  const [recipientEmail, setRecipientEmail] = useState(POLICY.landlord.email);
  const [message, setMessage] = useState("Hi — please find my proof of tenant insurance attached.");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-card rounded-2xl p-8 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">{method === "email" ? "Certificate Sent" : "Downloaded"}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {method === "email" ? `Emailed to ${recipientName} at ${recipientEmail}.` : "Your certificate has been downloaded."}
          </p>
          <button onClick={onClose} className="w-full bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent/90">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-foreground">Share Certificate</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-5">Send proof of insurance to your landlord</p>

        <div className="flex gap-2 mb-5">
          {(["email", "download"] as const).map((m) => (
            <button key={m} onClick={() => setMethod(m)} className={`flex-1 p-3 rounded-lg border-2 text-sm font-semibold text-center transition-all ${method === m ? "border-accent bg-accent/10 text-accent" : "border-border text-foreground"}`}>
              {m === "email" ? "Email to Landlord" : "Download PDF"}
            </button>
          ))}
        </div>

        {method === "email" && (
          <>
            <p className="text-xs text-muted-foreground mb-4">Pre-filled with your landlord's details. Edit if sending to someone else.</p>
            <label className="block text-sm font-semibold text-foreground mb-1">Recipient Name</label>
            <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent mb-3" />
            <label className="block text-sm font-semibold text-foreground mb-1">Recipient Email</label>
            <input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent mb-3" />
            <label className="block text-sm font-semibold text-foreground mb-1">Message (optional)</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent resize-none mb-4" />
          </>
        )}

        <button onClick={() => setSent(true)} disabled={method === "email" && !recipientEmail} className="w-full bg-accent text-white py-4 rounded-xl font-semibold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed">
          {method === "email" ? "Send Certificate" : "Download PDF"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// ADJUST COVERAGE MODAL
// ═══════════════════════════════════════════════════

function AdjustCoverageModal({ onClose }: { onClose: () => void }) {
  const [contents, setContents] = useState(POLICY.coverages[0].limit);
  const [liability, setLiability] = useState(String(POLICY.coverages[1].limit));
  const [deductible, setDeductible] = useState(POLICY.coverages[0].deductible);
  const [addOns, setAddOns] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const basePremium = contents * 0.012;
  const liabilityAdd: Record<string, number> = { "1000000": 0, "2000000": 35, "3000000": 65 };
  const deductibleMult: Record<number, number> = { 250: 1.12, 500: 1.0, 1000: 0.9, 2000: 0.8 };
  const addOnTotal = addOns.reduce((s, id) => s + (AVAILABLE_ADDONS.find((c) => c.id === id)?.startingAt ?? 0), 0);
  const estimated = Math.round(basePremium * (deductibleMult[deductible] ?? 1) + (liabilityAdd[liability] ?? 0) + addOnTotal);
  const monthly = Math.round(estimated / 12);
  const toggle = (id: string) => setAddOns((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-card rounded-2xl p-8 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Coverage Update Requested</h2>
          <p className="text-sm text-muted-foreground mb-6">Updated quote within 1 business day. No changes until you approve.</p>
          <button onClick={onClose} className="w-full bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent/90">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-foreground">Adjust Coverage</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-5">Modify limits, deductible, or add coverages</p>

        {/* Contents */}
        <label className="block text-sm font-semibold text-foreground mb-2">Contents Coverage</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {[15000, 25000, 40000, 60000, 80000, 100000].map((v) => (
            <button key={v} onClick={() => setContents(v)} className={`px-3 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${contents === v ? "border-accent bg-accent/10 text-accent" : "border-border text-foreground hover:border-accent/30"}`}>
              ${v >= 1000 ? `${v / 1000}K` : v}
            </button>
          ))}
        </div>

        {/* Liability */}
        <label className="block text-sm font-semibold text-foreground mb-2">Liability</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {["1000000", "2000000", "3000000"].map((v) => (
            <button key={v} onClick={() => setLiability(v)} className={`px-3 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${liability === v ? "border-accent bg-accent/10 text-accent" : "border-border text-foreground hover:border-accent/30"}`}>
              ${Number(v) / 1000000}M
            </button>
          ))}
        </div>

        {/* Deductible */}
        <label className="block text-sm font-semibold text-foreground mb-2">Deductible</label>
        <div className="flex flex-wrap gap-2 mb-1">
          {[250, 500, 1000, 2000].map((v) => (
            <button key={v} onClick={() => setDeductible(v)} className={`px-3 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${deductible === v ? "border-accent bg-accent/10 text-accent" : "border-border text-foreground hover:border-accent/30"}`}>
              ${v.toLocaleString()}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mb-5">Higher deductible = lower premium.</p>

        {/* Add-ons */}
        <label className="block text-sm font-semibold text-foreground mb-2">Add-on Coverages</label>
        <div className="space-y-2 mb-5">
          {AVAILABLE_ADDONS.map((cov) => (
            <button key={cov.id} onClick={() => toggle(cov.id)} className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-center justify-between ${addOns.includes(cov.id) ? "border-accent bg-accent/10" : "border-border hover:border-accent/30"}`}>
              <div>
                <p className="text-sm font-semibold text-foreground">{cov.name}</p>
                <p className="text-xs text-muted-foreground">{cov.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">+${cov.startingAt}/yr</span>
                {addOns.includes(cov.id) && (
                  <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Estimate */}
        <div className="bg-muted/30 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Current</span>
            <span className="text-sm font-semibold text-foreground">${POLICY.premium}/yr (${Math.round(POLICY.premium / 12)}/mo)</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Estimated new</span>
            <span className="text-lg font-extrabold text-accent">${monthly}/mo <span className="text-sm font-normal text-muted-foreground">(${estimated}/yr)</span></span>
          </div>
          {estimated !== POLICY.premium && (
            <div className="text-right">
              <span className={`text-sm font-semibold ${estimated > POLICY.premium ? "text-red-500" : "text-green-600"}`}>
                {estimated > POLICY.premium ? "+" : ""}${estimated - POLICY.premium}/yr ({estimated > POLICY.premium ? "+" : ""}${Math.round((estimated - POLICY.premium) / 12)}/mo)
              </span>
            </div>
          )}
        </div>

        <button onClick={() => setSubmitted(true)} className="w-full bg-accent text-white py-4 rounded-xl font-semibold hover:bg-accent/90">
          Request Coverage Update
        </button>
        <p className="text-xs text-muted-foreground text-center mt-2">No charges until you approve.</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// ADD ROOMMATE MODAL
// ═══════════════════════════════════════════════════

function AddRoommateModal({ onClose, onAdd }: { onClose: () => void; onAdd: (rm: any) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("Roommate");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-card rounded-2xl p-8 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Occupant Added</h2>
          <p className="text-sm text-muted-foreground mb-6">{name} has been added to your policy.</p>
          <button onClick={onClose} className="w-full bg-accent text-white py-3 rounded-xl font-semibold hover:bg-accent/90">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">Add Insured Occupant</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <label className="block text-sm font-semibold text-foreground mb-1">Full Name *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="First and last name" className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent mb-3" />

        <label className="block text-sm font-semibold text-foreground mb-1">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="roommate@email.com" className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent mb-3" />

        <label className="block text-sm font-semibold text-foreground mb-2">Relationship</label>
        <div className="flex gap-2 mb-4">
          {["Roommate", "Spouse / Partner", "Family Member"].map((r) => (
            <button key={r} onClick={() => setRelationship(r)} className={`flex-1 p-3 rounded-lg border-2 text-xs font-semibold text-center transition-all ${relationship === r ? "border-accent bg-accent/10 text-accent" : "border-border text-foreground hover:border-accent/30"}`}>
              {r}
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mb-4">Adding an occupant extends coverage to them at no additional cost.</p>

        <button onClick={() => { onAdd({ name, relationship, added: "2026-03-05" }); setSubmitted(true); }} disabled={!name} className="w-full bg-accent text-white py-4 rounded-xl font-semibold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed">
          Add to Policy
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MY POLICY
// ═══════════════════════════════════════════════════

export function TenantPolicy() {
  const [tab, setTab] = useState<"overview" | "coverages">("overview");
  const [showShare, setShowShare] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [showRoommate, setShowRoommate] = useState(false);
  const [roommates, setRoommates] = useState(POLICY.roommates);
  const p = POLICY;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-foreground mb-1">{p.address}</h1>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={p.status} />
            </div>
            <p className="text-sm text-muted-foreground">{p.id} · {p.plan} Plan · {p.building}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowShare(true)} className="px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-border text-foreground hover:border-accent/40">Send to Landlord</button>
            <button onClick={() => setShowAdjust(true)} className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent/90">Adjust Coverage</button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { l: "Monthly", v: `$${Math.round(p.premium / 12)}`, s: `$${p.premium}/yr`, accent: true },
          { l: "Contents", v: `$${p.coverages[0].limit / 1000}K`, s: "Replacement cost" },
          { l: "Liability", v: `$${p.coverages[1].limit / 1000000}M`, s: "Personal liability" },
          { l: "Deductible", v: `$${p.coverages[0].deductible}`, s: "Per claim" },
          { l: "Renewal", v: `${daysUntil(p.expiryDate)}d`, s: p.expiryDate },
        ].map((k, i) => (
          <div key={i} className="bg-card border-2 border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">{k.l}</p>
            <p className={`text-xl font-extrabold ${k.accent ? "text-accent" : "text-foreground"}`}>{k.v}</p>
            <p className="text-xs text-muted-foreground">{k.s}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {(["overview", "coverages"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${tab === t ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "overview" ? "Overview" : "Coverages"}
          </button>
        ))}
      </div>

      {tab === "coverages" ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Your Coverages</h3>
            <button onClick={() => setShowAdjust(true)} className="text-sm text-accent font-semibold hover:underline">Adjust</button>
          </div>
          <div className="space-y-3">
            {p.coverages.map((c, i) => (
              <div key={i} className="bg-card border-2 border-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{c.name}</p>
                  {c.detail && <p className="text-xs text-muted-foreground">{c.detail}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">${c.limit.toLocaleString()}</p>
                  {c.deductible > 0 && <p className="text-xs text-muted-foreground">${c.deductible} ded.</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Landlord */}
          <div className="bg-card border-2 border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-3">Your Landlord</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { l: "Name", v: p.landlord.name },
                { l: "Email", v: p.landlord.email },
                { l: "Phone", v: p.landlord.phone },
              ].map((d, i) => (
                <div key={i}>
                  <p className="text-xs text-muted-foreground">{d.l}</p>
                  <p className="text-sm font-semibold text-foreground">{d.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Policy Details */}
          <div className="bg-card border-2 border-border rounded-2xl p-5">
            <h3 className="font-bold text-foreground mb-3">Policy Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { l: "Policy #", v: p.id },
                { l: "Plan", v: p.plan },
                { l: "Unit Type", v: p.unitType },
                { l: "Building", v: p.building },
                { l: "Effective", v: p.effectiveDate },
                { l: "Expires", v: p.expiryDate },
              ].map((d, i) => (
                <div key={i}>
                  <p className="text-xs text-muted-foreground">{d.l}</p>
                  <p className="text-sm font-semibold text-foreground">{d.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Insured Occupants */}
          <div className="bg-card border-2 border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground">Insured Occupants</h3>
              <button onClick={() => setShowRoommate(true)} className="text-xs text-accent font-semibold hover:underline">+ Add</button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">Priya Sharma</p>
                  <p className="text-xs text-muted-foreground">Primary Policyholder</p>
                </div>
              </div>
              {roommates.map((rm, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-t border-border">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{rm.name}</p>
                    <p className="text-xs text-muted-foreground">{rm.relationship} · Added {rm.added}</p>
                  </div>
                  <button onClick={() => setRoommates((r) => r.filter((_, j) => j !== i))} className="text-xs text-red-500 font-semibold hover:underline">Remove</button>
                </div>
              ))}
            </div>
          </div>

          {/* Claims */}
          <div className="bg-card border-2 border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground">Claims</h3>
              <button onClick={() => (window.location.href = "/claims")} className="px-4 py-2 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent/90">File a Claim</button>
            </div>
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              </div>
              <h4 className="font-bold text-foreground mb-1">No claims filed</h4>
              <p className="text-sm text-muted-foreground">That's a good thing! If you ever need to report an incident, you can file a claim from here.</p>
            </div>
          </div>
        </div>
      )}

      {showShare && <ShareCertificateModal onClose={() => setShowShare(false)} />}
      {showAdjust && <AdjustCoverageModal onClose={() => setShowAdjust(false)} />}
      {showRoommate && <AddRoommateModal onClose={() => setShowRoommate(false)} onAdd={(rm) => setRoommates((r) => [...r, rm])} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// CONTENTS INVENTORY
// ═══════════════════════════════════════════════════

export function TenantInventory() {
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [addingItem, setAddingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ name: "", value: "", year: "" });

  const totalValue = inventory.reduce((s, r) => s + r.items.reduce((rs, it) => rs + it.value, 0), 0);
  const totalItems = inventory.reduce((s, r) => s + r.items.length, 0);
  const contentsLimit = POLICY.coverages[0].limit;
  const overLimit = totalValue > contentsLimit;

  const addItem = (roomId: string) => {
    if (!newItem.name || !newItem.value) return;
    setInventory((inv) =>
      inv.map((r) =>
        r.id === roomId
          ? { ...r, items: [...r.items, { name: newItem.name, value: parseInt(newItem.value) || 0, year: newItem.year ? parseInt(newItem.year) : null }] }
          : r
      )
    );
    setNewItem({ name: "", value: "", year: "" });
    setAddingItem(null);
  };

  const removeItem = (roomId: string, itemIdx: number) => {
    setInventory((inv) => inv.map((r) => (r.id === roomId ? { ...r, items: r.items.filter((_, i) => i !== itemIdx) } : r)));
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-foreground mb-1">Contents Inventory</h1>
          <p className="text-sm text-muted-foreground">
            {totalItems} items · Total value: <span className={`font-bold ${overLimit ? "text-red-500" : "text-foreground"}`}>${totalValue.toLocaleString()}</span>
          </p>
          {overLimit && (
            <p className="text-xs text-red-500 font-semibold mt-1">
              ⚠ Exceeds your ${contentsLimit.toLocaleString()} limit by ${(totalValue - contentsLimit).toLocaleString()}
            </p>
          )}
        </div>
        <button className="px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-border text-foreground hover:border-accent/40">Export CSV</button>
      </div>

      {overLimit && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-amber-500 text-lg">⚠</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Inventory exceeds your coverage</p>
            <p className="text-xs text-amber-700">Consider increasing your contents limit to avoid being underinsured.</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {inventory.map((room) => {
          const roomTotal = room.items.reduce((s, it) => s + it.value, 0);
          return (
            <div key={room.id} className="bg-card border-2 border-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 bg-muted/30">
                <div>
                  <h3 className="font-bold text-foreground">{room.name}</h3>
                  <p className="text-xs text-muted-foreground">{room.items.length} items</p>
                </div>
                <p className="text-sm font-bold text-foreground">${roomTotal.toLocaleString()}</p>
              </div>
              <div className="divide-y divide-border">
                {room.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm text-foreground">{item.name}</p>
                      {item.year && <p className="text-xs text-muted-foreground">Purchased {item.year}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-foreground">${item.value.toLocaleString()}</p>
                      <button onClick={() => removeItem(room.id, i)} className="text-muted-foreground/40 hover:text-red-500">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {addingItem === room.id ? (
                <div className="px-5 py-3 bg-muted/20 flex items-center gap-2 flex-wrap">
                  <input value={newItem.name} onChange={(e) => setNewItem((n) => ({ ...n, name: e.target.value }))} placeholder="Item name" className="flex-1 min-w-[120px] p-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-accent" />
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <input value={newItem.value} onChange={(e) => setNewItem((n) => ({ ...n, value: e.target.value }))} placeholder="Value" type="number" className="w-24 pl-6 p-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-accent" />
                  </div>
                  <input value={newItem.year} onChange={(e) => setNewItem((n) => ({ ...n, year: e.target.value }))} placeholder="Year" type="number" className="w-20 p-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-accent" />
                  <button onClick={() => addItem(room.id)} className="px-3 py-2 rounded-lg bg-accent text-white text-sm font-semibold">Add</button>
                  <button onClick={() => { setAddingItem(null); setNewItem({ name: "", value: "", year: "" }); }} className="px-2 text-muted-foreground hover:text-foreground">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              ) : (
                <button onClick={() => setAddingItem(room.id)} className="w-full px-5 py-3 text-left text-sm text-accent font-semibold hover:bg-accent/5 flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Add item
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mt-6">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Tip:</span> Keep your inventory current. Documented belongings with purchase years dramatically speeds up claim settlement. Add photos and receipts for high-value items.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// DOCUMENTS
// ═══════════════════════════════════════════════════

export function TenantDocuments() {
  const [showShare, setShowShare] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-extrabold text-foreground">Documents</h1>
        <button onClick={() => setShowShare(true)} className="text-sm text-accent font-semibold hover:underline">Share Certificate</button>
      </div>
      <div className="space-y-3">
        {[...POLICY.documents, ...POLICY.receipts].map((doc, i) => (
          <div key={i} className="bg-card border-2 border-border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-blue-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{doc.date} · {doc.size}</p>
              </div>
            </div>
            <button className="text-sm text-accent font-semibold hover:underline">Download</button>
          </div>
        ))}
      </div>
      {showShare && <ShareCertificateModal onClose={() => setShowShare(false)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// BILLING
// ═══════════════════════════════════════════════════

export function TenantBilling() {
  const p = POLICY;

  return (
    <div>
      <h1 className="text-xl font-extrabold text-foreground mb-6">Billing</h1>

      <div className="bg-card border-2 border-border rounded-2xl p-5 mb-6">
        <h3 className="font-bold text-foreground mb-3">Payment Details</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { l: "Annual Premium", v: `$${p.premium}` },
            { l: "Frequency", v: p.paymentFrequency },
            { l: "Monthly Amount", v: `$${p.nextPaymentAmount}` },
            { l: "Next Payment", v: p.nextPayment },
            { l: "Method", v: "Visa ••••3017" },
          ].map((d, i) => (
            <div key={i}>
              <p className="text-xs text-muted-foreground">{d.l}</p>
              <p className="text-sm font-semibold text-foreground">{d.v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border-2 border-border rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Payment History</h3>
          <button className="text-sm text-accent font-semibold hover:underline flex items-center gap-1">
            Download Statement
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="7 10 12 15 17 10" /></svg>
          </button>
        </div>
        <div className="space-y-3">
          {p.receipts.map((r, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-semibold text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.date}</p>
              </div>
              <p className="text-sm font-bold text-foreground">${p.nextPaymentAmount}</p>
            </div>
          ))}
        </div>
      </div>

      <button className="px-5 py-2.5 rounded-xl text-sm font-semibold border-2 border-border text-foreground hover:border-accent/40">
        Update Payment Method
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// CLAIMS
// ═══════════════════════════════════════════════════

export function TenantClaims() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-extrabold text-foreground">Claims</h1>
        <button onClick={() => (window.location.href = "/claims")} className="px-4 py-2 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent/90">+ File a Claim</button>
      </div>
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">No claims filed</h2>
        <p className="text-sm text-muted-foreground">That's a good thing! If you ever need to report an incident, you can file a claim from here.</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// REFERRALS
// ═══════════════════════════════════════════════════

export function TenantReferrals() {
  const r = REFERRAL;
  const [copied, setCopied] = useState(false);
  const bound = r.referrals.filter((ref) => ref.status === "Bound").length;

  return (
    <div>
      {/* Hero */}
      <div className="bg-accent rounded-2xl p-6 text-white mb-6">
        <h1 className="text-xl font-extrabold mb-1">Refer a friend, earn ${r.reward}</h1>
        <p className="text-sm opacity-90 mb-4">When they bind a policy, you both earn a ${r.reward} account credit.</p>
        <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3 mb-4">
          <p className="text-sm font-mono flex-1 truncate">{r.link}</p>
          <button onClick={() => { navigator.clipboard?.writeText(r.link); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="px-5 py-2.5 rounded-lg bg-white text-accent font-semibold text-sm">
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { v: `$${r.balance}`, l: "Credit" },
            { v: `$${r.totalEarned}`, l: "Earned" },
            { v: String(bound), l: "Successful" },
          ].map((k, i) => (
            <div key={i} className="text-center">
              <p className="text-lg font-extrabold">{k.v}</p>
              <p className="text-xs opacity-80">{k.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-card border-2 border-border rounded-2xl p-5 mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { step: "Share your link", desc: "Send to friends who rent in Ontario" },
            { step: "They get a quote", desc: "60-second instant quote" },
            { step: `You both earn $${r.reward}`, desc: "Applied to next billing" },
          ].map((s, i) => (
            <div key={i}>
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
                <span className="text-sm font-bold text-accent">{i + 1}</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{s.step}</p>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="bg-card border-2 border-border rounded-2xl p-5">
        <h3 className="font-bold text-foreground mb-4">Referral History</h3>
        <div className="space-y-3">
          {r.referrals.map((ref, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-semibold text-foreground">{ref.name}</p>
                <p className="text-xs text-muted-foreground">{ref.date} · {ref.policyType}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={ref.status} />
                {ref.reward && <span className="text-sm font-bold text-green-600">+${ref.reward}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════

export function TenantSettings() {
  const [profile, setProfile] = useState({
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya.sharma@email.com",
    phone: "(647) 555-0283",
  });
  const [saved, setSaved] = useState(false);
  const [roommates, setRoommates] = useState(POLICY.roommates);
  const [showRoommate, setShowRoommate] = useState(false);
  const [notifications, setNotifications] = useState({
    payments: true, claims: true, renewals: true, certificates: true, tips: false,
  });

  const update = (key: string, val: string) => setProfile((p) => ({ ...p, [key]: val }));

  return (
    <div>
      <h1 className="text-xl font-extrabold text-foreground mb-6">Account Settings</h1>

      {/* Personal Info */}
      <div className="bg-card border-2 border-border rounded-2xl p-5 mb-6">
        <h3 className="font-bold text-foreground mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {[
            { l: "First Name", k: "firstName" },
            { l: "Last Name", k: "lastName" },
            { l: "Email", k: "email" },
            { l: "Phone", k: "phone" },
          ].map((f) => (
            <div key={f.k}>
              <label className="block text-sm font-semibold text-foreground mb-1">{f.l}</label>
              <input value={(profile as any)[f.k]} onChange={(e) => update(f.k, e.target.value)} className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent" />
            </div>
          ))}
        </div>
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent/90">
          {saved ? "Saved ✓" : "Save Changes"}
        </button>
      </div>

      {/* Password */}
      <div className="bg-card border-2 border-border rounded-2xl p-5 mb-6">
        <h3 className="font-bold text-foreground mb-4">Password</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Current Password</label>
            <input type="password" className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">New Password</label>
            <input type="password" className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent" />
          </div>
        </div>
        <button className="px-5 py-2.5 rounded-xl text-sm font-semibold border-2 border-border text-foreground hover:border-accent/40">Update Password</button>
      </div>

      {/* Roommate Management */}
      <div className="bg-card border-2 border-border rounded-2xl p-5 mb-6">
        <h3 className="font-bold text-foreground mb-2">Roommate Management</h3>
        <p className="text-sm text-muted-foreground mb-4">Manage insured occupants on your policy.</p>
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-semibold text-foreground">Priya Sharma</p>
              <p className="text-xs text-muted-foreground">Primary Policyholder</p>
            </div>
          </div>
          {roommates.map((rm, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-t border-border">
              <div>
                <p className="text-sm font-semibold text-foreground">{rm.name}</p>
                <p className="text-xs text-muted-foreground">{rm.relationship} · Added {rm.added}</p>
              </div>
              <button onClick={() => setRoommates((r) => r.filter((_, j) => j !== i))} className="text-xs text-red-500 font-semibold hover:underline">Remove</button>
            </div>
          ))}
        </div>
        <button onClick={() => setShowRoommate(true)} className="flex items-center gap-1 text-sm text-accent font-semibold hover:underline">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Occupant
        </button>
      </div>

      {/* Notification Preferences */}
      <div className="bg-card border-2 border-border rounded-2xl p-5">
        <h3 className="font-bold text-foreground mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          {[
            { k: "payments", l: "Payment reminders" },
            { k: "claims", l: "Claim status updates" },
            { k: "renewals", l: "Renewal notices" },
            { k: "certificates", l: "Certificate requests from landlord" },
            { k: "tips", l: "Tips & product updates" },
          ].map((n) => (
            <label key={n.k} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-foreground">{n.l}</span>
              <div
                onClick={() => setNotifications((prev) => ({ ...prev, [n.k]: !(prev as any)[n.k] }))}
                className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${(notifications as any)[n.k] ? "bg-accent" : "bg-muted"}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${(notifications as any)[n.k] ? "left-5" : "left-1"}`} />
              </div>
            </label>
          ))}
        </div>
      </div>

      {showRoommate && <AddRoommateModal onClose={() => setShowRoommate(false)} onAdd={(rm) => setRoommates((r) => [...r, rm])} />}
    </div>
  );
}
