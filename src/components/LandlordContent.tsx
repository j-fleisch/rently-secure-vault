// File: src/components/LandlordContent.tsx
// All landlord portal section content

import { useState, useCallback } from "react";

// ═══ SHARED HELPERS ═══

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = {
    Active: "bg-green-100 text-green-800",
    "Renewal Due": "bg-amber-100 text-amber-800",
    "In Review": "bg-amber-100 text-amber-800",
    Settled: "bg-green-100 text-green-800",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${s[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

function DocIcon({ type }: { type: string }) {
  const c: Record<string, string> = {
    declaration: "bg-blue-100 text-blue-600",
    policy: "bg-purple-100 text-purple-600",
    certificate: "bg-green-100 text-green-600",
    endorsement: "bg-amber-100 text-amber-600",
    receipt: "bg-gray-100 text-gray-600",
  };
  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c[type] || "bg-muted"}`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    </div>
  );
}

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - new Date("2026-03-05").getTime()) / 86400000);
}

// ═══ MOCK DATA ═══

interface Coverage {
  name: string;
  limit: number | null;
  deductible: number;
  detail?: string;
}

interface AdditionalInsured {
  name: string;
  type: string;
  added: string;
}

interface PolicyDoc {
  name: string;
  type: string;
  date: string;
  size: string;
}

interface Claim {
  id: string;
  type: string;
  status: string;
  date: string;
  amount: number;
}

interface Policy {
  id: string;
  address: string;
  plan: string;
  status: string;
  effectiveDate: string;
  expiryDate: string;
  premium: number;
  paymentFrequency: string;
  nextPayment: string;
  nextPaymentAmount: number;
  propertyType: string;
  units: number;
  yearBuilt: number;
  sqft: number;
  coverages: Coverage[];
  additionalInsureds: AdditionalInsured[];
  documents: PolicyDoc[];
  claims: Claim[];
}

const POLICIES: Policy[] = [
  {
    id: "CED-2025-001247",
    address: "123 Queen St W, Toronto, ON M5H 2M9",
    plan: "Standard",
    status: "Active",
    effectiveDate: "2025-08-15",
    expiryDate: "2026-08-15",
    premium: 2340,
    paymentFrequency: "Monthly",
    nextPayment: "2026-03-15",
    nextPaymentAmount: 195,
    propertyType: "Semi-Detached",
    units: 2,
    yearBuilt: 1987,
    sqft: 1450,
    coverages: [
      { name: "Dwelling", limit: 425000, deductible: 1000 },
      { name: "Liability", limit: 2000000, deductible: 0 },
      { name: "Loss of Rental Income", limit: 70200, deductible: 0, detail: "18 months" },
      { name: "Sewer & Water Backup", limit: 50000, deductible: 1000 },
      { name: "Equipment Breakdown", limit: 100000, deductible: 500 },
    ],
    additionalInsureds: [
      { name: "TD Bank — Mortgage Dept", type: "Mortgagee", added: "2025-08-15" },
    ],
    documents: [
      { name: "Policy Declaration", type: "declaration", date: "2025-08-15", size: "142 KB" },
      { name: "Full Policy Wording", type: "policy", date: "2025-08-15", size: "1.2 MB" },
      { name: "Certificate of Insurance", type: "certificate", date: "2025-08-15", size: "86 KB" },
      { name: "Sewer Backup Endorsement", type: "endorsement", date: "2025-08-15", size: "54 KB" },
      { name: "Payment Receipt — Feb 2026", type: "receipt", date: "2026-02-15", size: "38 KB" },
      { name: "Payment Receipt — Jan 2026", type: "receipt", date: "2026-01-15", size: "38 KB" },
    ],
    claims: [
      { id: "CLM-2025-00421", type: "Water Damage", status: "In Review", date: "2025-11-14", amount: 8500 },
    ],
  },
  {
    id: "CED-2025-003891",
    address: "456 Dundas St E, Toronto, ON M5A 2B6",
    plan: "Premium",
    status: "Active",
    effectiveDate: "2025-10-01",
    expiryDate: "2026-10-01",
    premium: 4250,
    paymentFrequency: "Annual",
    nextPayment: "2026-10-01",
    nextPaymentAmount: 4250,
    propertyType: "Multi-Unit Residential",
    units: 4,
    yearBuilt: 2005,
    sqft: 2100,
    coverages: [
      { name: "Dwelling", limit: 680000, deductible: 2500 },
      { name: "Liability", limit: 5000000, deductible: 0 },
      { name: "Loss of Rental Income", limit: 156000, deductible: 0, detail: "24 months" },
      { name: "Sewer & Water Backup", limit: 100000, deductible: 2500 },
      { name: "Equipment Breakdown", limit: 200000, deductible: 1000 },
      { name: "Identity Theft", limit: 25000, deductible: 0 },
      { name: "Guaranteed Replacement Cost", limit: null, deductible: 0, detail: "Unlimited" },
    ],
    additionalInsureds: [
      { name: "RFA Mortgage Corporation", type: "Mortgagee", added: "2025-10-01" },
      { name: "Apex Property Management Inc.", type: "Additional Insured", added: "2025-10-01" },
    ],
    documents: [
      { name: "Policy Declaration", type: "declaration", date: "2025-10-01", size: "156 KB" },
      { name: "Full Policy Wording", type: "policy", date: "2025-10-01", size: "1.2 MB" },
      { name: "Certificate of Insurance", type: "certificate", date: "2025-10-01", size: "86 KB" },
      { name: "Annual Payment Receipt", type: "receipt", date: "2025-10-01", size: "42 KB" },
    ],
    claims: [],
  },
];

const MAINTENANCE_TYPES = [
  "Plumbing", "Electrical", "Roof", "HVAC", "Safety", "Foundation",
  "Windows / Doors", "Exterior", "Appliances", "General Repair", "Other",
];

interface MaintenanceEntry {
  id: string;
  property: string;
  date: string;
  type: string;
  description: string;
  cost: number;
  contractor: string;
  premiumImpact: string;
  hasReceipt: boolean;
}

const MOCK_MAINTENANCE: MaintenanceEntry[] = [
  { id: "m1", property: "123 Queen St W", date: "2026-02-15", type: "Plumbing", description: "Replaced main stack and all copper supply lines with PEX", cost: 12500, contractor: "GTA Plumbing Solutions", premiumImpact: "May reduce premium — updated plumbing reduces water damage risk", hasReceipt: true },
  { id: "m2", property: "123 Queen St W", date: "2025-12-01", type: "Electrical", description: "Full panel upgrade from 100A to 200A with arc-fault breakers", cost: 4800, contractor: "Volt Electric", premiumImpact: "May reduce premium — modern electrical reduces fire risk", hasReceipt: true },
  { id: "m3", property: "456 Dundas St E", date: "2025-11-15", type: "Roof", description: "Full roof replacement — modified bitumen, 20-year warranty", cost: 18000, contractor: "Toronto Roofing Co.", premiumImpact: "New roof typically reduces premium 5-10% at renewal", hasReceipt: true },
  { id: "m4", property: "123 Queen St W", date: "2025-09-20", type: "HVAC", description: "Installed new high-efficiency furnace (96% AFUE) and AC unit", cost: 7200, contractor: "Comfort Air HVAC", premiumImpact: "May reduce premium — new equipment less prone to breakdown", hasReceipt: false },
  { id: "m5", property: "456 Dundas St E", date: "2025-08-10", type: "Safety", description: "Installed interconnected smoke/CO detectors in all units + hallways", cost: 1200, contractor: "Self-installed", premiumImpact: "Monitored detection systems may qualify for safety discount", hasReceipt: true },
];

const AVAILABLE_COVERAGES = [
  { id: "sewer", name: "Sewer & Water Backup", desc: "Covers damage from sewer backup, sump pump failure, or overland water", startingAt: 120, popular: true },
  { id: "equipment", name: "Equipment Breakdown", desc: "Mechanical/electrical breakdown of HVAC, boilers, water heaters", startingAt: 85, popular: true },
  { id: "identity", name: "Identity Theft Protection", desc: "Covers expenses to restore identity including legal fees and lost wages", startingAt: 45, popular: false },
  { id: "overland", name: "Overland Water / Flood", desc: "Rising water from rivers, lakes, or extreme rainfall events", startingAt: 200, popular: false },
  { id: "vacancy", name: "Vacancy Endorsement", desc: "Maintains coverage during extended vacancy beyond 30 days", startingAt: 150, popular: false },
  { id: "legal", name: "Legal Expense Coverage", desc: "Legal costs for tenant disputes, eviction proceedings, lease enforcement", startingAt: 95, popular: false },
  { id: "replacement", name: "Guaranteed Replacement Cost", desc: "Full rebuild cost even if it exceeds your dwelling coverage limit", startingAt: 180, popular: false },
  { id: "bylaw", name: "Building Bylaw Coverage", desc: "Covers additional cost to rebuild to current building code standards", startingAt: 75, popular: false },
];

const REFERRAL_DATA = {
  code: "MARCUS50",
  link: "https://cedar.insure/r/MARCUS50",
  reward: 50,
  balance: 100,
  totalEarned: 250,
  referrals: [
    { name: "James Park", status: "Bound", date: "2026-02-08", reward: 50, policyType: "Landlord" },
    { name: "Sarah Lin", status: "Bound", date: "2026-01-15", reward: 50, policyType: "Tenant" },
    { name: "David Thompson", status: "Bound", date: "2025-12-20", reward: 50, policyType: "Landlord" },
    { name: "Amy Rodriguez", status: "Quoted", date: "2026-02-28", reward: 0, policyType: "Landlord" },
    { name: "Kevin Nguyen", status: "Quoted", date: "2026-03-01", reward: 0, policyType: "Tenant" },
    { name: "Lisa Chen", status: "Expired", date: "2025-11-01", reward: 0, policyType: "Landlord" },
  ],
};

// ═══ SHARE MODAL ═══

function ShareModal({ policy, onClose }: { policy: Policy; onClose: () => void }) {
  const [method, setMethod] = useState<"email" | "download">("email");
  const [docType, setDocType] = useState("Certificate of Insurance");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-card rounded-2xl p-8 max-w-md w-full text-center" onClick={e => e.stopPropagation()}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" className="mx-auto mb-4">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h3 className="text-lg font-bold text-foreground mb-2">{method === "email" ? "Sent" : "Downloaded"}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your document has been {method === "email" ? `emailed to ${name} at ${email}` : "downloaded"}.
          </p>
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-6 max-w-lg w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">Share Documents</h3>
            <p className="text-xs text-muted-foreground">{policy.id}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex gap-3 mb-6">
          {(["email", "download"] as const).map(m => (
            <button key={m} onClick={() => setMethod(m)}
              className={`flex-1 p-3 rounded-lg border-2 text-sm font-semibold text-center transition-all capitalize ${method === m ? "border-accent bg-accent/10 text-accent" : "border-border text-foreground"}`}>
              {m === "email" ? "Email Directly" : "Download PDF"}
            </button>
          ))}
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1">Document</label>
            <select value={docType} onChange={e => setDocType(e.target.value)}
              className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground text-sm outline-none focus:border-accent appearance-none">
              <option>Certificate of Insurance</option>
              <option>Declarations Page</option>
              <option>Full Policy Wording</option>
            </select>
          </div>
          {method === "email" && (
            <>
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1">Recipient Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Name"
                  className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground text-sm outline-none focus:border-accent" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1">Recipient Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com"
                  className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground text-sm outline-none focus:border-accent" />
              </div>
            </>
          )}
        </div>

        <button onClick={() => setSent(true)}
          className="w-full bg-accent text-white py-4 rounded-xl font-semibold hover:bg-accent/90">
          {method === "email" ? "Send" : "Download PDF"}
        </button>
      </div>
    </div>
  );
}

// ═══ ADD COVERAGE MODAL ═══

function AddCoverageModal({ policy, onClose }: { policy: Policy; onClose: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const existing = policy.coverages.map(c => c.name.toLowerCase());
  const available = AVAILABLE_COVERAGES.filter(ac => !existing.some(n => n.includes(ac.name.toLowerCase().split(" ")[0])));
  const toggle = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const total = selected.reduce((s, id) => s + (AVAILABLE_COVERAGES.find(c => c.id === id)?.startingAt || 0), 0);

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-card rounded-2xl p-8 max-w-md w-full text-center" onClick={e => e.stopPropagation()}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" className="mx-auto mb-4">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h3 className="text-lg font-bold text-foreground mb-2">Coverage Request Submitted</h3>
          <p className="text-sm text-muted-foreground mb-4">We'll send an updated quote within 1 business day.</p>
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">Add Coverage</h3>
            <p className="text-xs text-muted-foreground">{policy.id} — {policy.plan} Plan</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {available.map(cov => (
            <button key={cov.id} onClick={() => toggle(cov.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selected.includes(cov.id) ? "border-accent bg-accent/10" : "border-border hover:border-accent/30"}`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground text-sm">{cov.name}</span>
                <span className="text-sm">
                  <span className="font-bold text-accent">+${cov.startingAt}</span>
                  <span className="text-muted-foreground text-xs">/yr est.</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{cov.desc}</p>
            </button>
          ))}
        </div>

        {selected.length > 0 && (
          <div className="bg-muted/30 rounded-xl p-4 mb-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{selected.length} selected</span>
            <span className="font-bold text-accent">~${total}/yr</span>
          </div>
        )}

        <button onClick={() => setSubmitted(true)} disabled={!selected.length}
          className="w-full bg-accent text-white py-4 rounded-xl font-semibold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed">
          Request Coverage Update
        </button>
      </div>
    </div>
  );
}

// ═══ POLICIES SECTION ═══

export function LandlordPolicies() {
  const [activePolicy, setActivePolicy] = useState<string | null>(null);
  const [policyTab, setPolicyTab] = useState<"overview" | "coverages" | "documents" | "billing">("overview");
  const [showShare, setShowShare] = useState(false);
  const [showAddCov, setShowAddCov] = useState(false);

  const policy = POLICIES.find(p => p.id === activePolicy);

  // Policy detail view
  if (policy) {
    const daysRenewal = daysUntil(policy.expiryDate);

    return (
      <div>
        <button onClick={() => { setActivePolicy(null); setPolicyTab("overview"); }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent mb-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          All Policies
        </button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">{policy.address}</h1>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={policy.status} />
              <span className="text-sm text-muted-foreground">{policy.id} · {policy.plan} Plan · {policy.propertyType} · {policy.units} units</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowShare(true)} className="px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-border text-foreground hover:border-accent/40">Share</button>
            <button onClick={() => setShowAddCov(true)} className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent/90">+ Add Coverage</button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border-2 border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Annual Premium</p>
            <p className="text-2xl font-extrabold text-accent">${policy.premium.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">${Math.round(policy.premium / 12)}/mo</p>
          </div>
          <div className="bg-card border-2 border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Next Payment</p>
            <p className="text-2xl font-extrabold text-foreground">${policy.nextPaymentAmount}</p>
            <p className="text-xs text-muted-foreground">In {daysUntil(policy.nextPayment)} days</p>
          </div>
          <div className="bg-card border-2 border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Renewal</p>
            <p className="text-2xl font-extrabold text-foreground">{policy.expiryDate}</p>
            <p className="text-xs text-muted-foreground">{daysRenewal} days</p>
          </div>
          <div className="bg-card border-2 border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Open Claims</p>
            <p className="text-2xl font-extrabold text-foreground">{policy.claims.length}</p>
            <p className="text-xs text-muted-foreground">{policy.claims.length ? policy.claims[0].status : "None"}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/30 rounded-xl p-1 mb-6">
          {(["overview", "coverages", "documents", "billing"] as const).map(t => (
            <button key={t} onClick={() => setPolicyTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize ${policyTab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {policyTab === "overview" && (
          <div className="space-y-6">
            <div className="bg-card border-2 border-border rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">Property Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ["Address", policy.address],
                  ["Type", policy.propertyType],
                  ["Units", String(policy.units)],
                  ["Year Built", String(policy.yearBuilt)],
                  ["Sq Ft", policy.sqft.toLocaleString()],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-muted-foreground text-xs">{label}</p>
                    <p className="font-semibold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border-2 border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">Additional Insured</h3>
                <button className="text-sm text-accent font-semibold hover:underline">+ Add</button>
              </div>
              {policy.additionalInsureds.length === 0 ? (
                <p className="text-sm text-muted-foreground">No additional insureds.</p>
              ) : (
                <div className="space-y-3">
                  {policy.additionalInsureds.map((ai, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{ai.name}</p>
                        <p className="text-xs text-muted-foreground">{ai.type} · Added {ai.added}</p>
                      </div>
                      <button className="text-xs text-red-500 hover:underline">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card border-2 border-border rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">Policy Info</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ["Policy #", policy.id],
                  ["Plan", policy.plan + " Plan"],
                  ["Effective", policy.effectiveDate],
                  ["Expiry", policy.expiryDate],
                  ["Payment", policy.paymentFrequency],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-muted-foreground text-xs">{label}</p>
                    <p className="font-semibold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Claims */}
            <div className="bg-card border-2 border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">Claims</h3>
                <button onClick={() => window.location.href = "/claims"} className="text-sm text-accent font-semibold hover:underline">File a Claim</button>
              </div>
              {policy.claims.length === 0 ? (
                <p className="text-sm text-muted-foreground">No claims filed.</p>
              ) : (
                <div className="space-y-3">
                  {policy.claims.map(c => (
                    <div key={c.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{c.id}</p>
                        <p className="text-xs text-muted-foreground">{c.type} · Filed {c.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={c.status} />
                        <span className="text-sm font-bold text-foreground">${c.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {policyTab === "coverages" && (
          <div className="bg-card border-2 border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">{policy.coverages.length} coverages</h3>
              <button onClick={() => setShowAddCov(true)} className="text-sm text-accent font-semibold hover:underline">+ Add Coverage</button>
            </div>
            <div className="space-y-3">
              {policy.coverages.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.name}</p>
                    {c.detail && <p className="text-xs text-muted-foreground">{c.detail}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{c.limit ? `$${c.limit.toLocaleString()}` : c.detail || "—"}</p>
                    <p className="text-xs text-muted-foreground">${c.deductible.toLocaleString()} deductible</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {policyTab === "documents" && (
          <div className="bg-card border-2 border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">{policy.documents.length} documents</h3>
              <button onClick={() => setShowShare(true)} className="text-sm text-accent font-semibold hover:underline">Share</button>
            </div>
            <div className="space-y-3">
              {policy.documents.map((d, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <DocIcon type={d.type} />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.date} · {d.size}</p>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-accent">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {policyTab === "billing" && (
          <div className="space-y-6">
            <div className="bg-card border-2 border-border rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">Payment Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ["Annual Premium", `$${policy.premium.toLocaleString()}`],
                  ["Frequency", policy.paymentFrequency],
                  ["Amount", `$${policy.nextPaymentAmount}`],
                  ["Next Payment", policy.nextPayment],
                  ["Method", "Visa ••••4821"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-muted-foreground text-xs">{label}</p>
                    <p className="font-semibold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
              <button className="mt-4 text-sm text-accent font-semibold hover:underline">Update Payment Method</button>
            </div>

            <div className="bg-card border-2 border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">Payment History</h3>
                <button className="text-sm text-accent font-semibold hover:underline">Download Statement</button>
              </div>
              {policy.documents.filter(d => d.type === "receipt").map((d, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-green-500">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <div>
                      <p className="text-sm text-foreground">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.date}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-foreground">${policy.nextPaymentAmount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showShare && <ShareModal policy={policy} onClose={() => setShowShare(false)} />}
        {showAddCov && <AddCoverageModal policy={policy} onClose={() => setShowAddCov(false)} />}
      </div>
    );
  }

  // Policy list view
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Your Policies</h1>
        <button onClick={() => window.location.href = "/quote"} className="px-4 py-2 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent/90">+ Add Property</button>
      </div>

      <div className="space-y-4">
        {POLICIES.map(p => (
          <button key={p.id} onClick={() => setActivePolicy(p.id)}
            className="w-full text-left bg-card border-2 border-border rounded-2xl p-6 hover:border-accent/30 hover:shadow-sm cursor-pointer transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">{p.address}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={p.status} />
                  <span className="text-xs text-muted-foreground">{p.id} · {p.plan} · {p.units} units</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold text-accent">${p.premium.toLocaleString()}/yr</p>
                <p className="text-xs text-muted-foreground">${Math.round(p.premium / 12)}/mo</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.coverages.slice(0, 4).map((c, i) => (
                <span key={i} className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
                  {c.name}: {c.limit ? `$${(c.limit / 1000).toLocaleString()}K` : c.detail}
                </span>
              ))}
              {p.coverages.length > 4 && (
                <span className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground">+{p.coverages.length - 4} more</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══ PORTFOLIO ═══

export function LandlordPortfolio() {
  const d = {
    totalPremium: 6590,
    totalInsured: 1105000,
    totalUnits: 6,
    claimsRatio: 2.1,
    totalRent: 10400,
  };

  const properties = [
    { address: "123 Queen St W", id: "CED-2025-001247", plan: "Standard", units: 2, premium: 2340, insured: 425000, occupancy: "100%", rent: 3900, claims: 1, renewal: "2026-08-15" },
    { address: "456 Dundas St E", id: "CED-2025-003891", plan: "Premium", units: 4, premium: 4250, insured: 680000, occupancy: "75%", rent: 6500, claims: 0, renewal: "2026-10-01" },
  ];

  const nextRenewal = properties.reduce((min, p) => p.renewal < min ? p.renewal : min, "9999-99-99");

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-foreground mb-6">Portfolio Overview</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total Premium", value: `$${d.totalPremium.toLocaleString()}`, sub: `$${Math.round(d.totalPremium / 12)}/mo`, accent: true },
          { label: "Insured Value", value: `$${(d.totalInsured / 1000).toLocaleString()}K`, sub: `${properties.length} properties, ${d.totalUnits} units` },
          { label: "Claims Ratio", value: `${d.claimsRatio}%`, sub: "1 open claim" },
          { label: "Avg Cost/Unit", value: `$${Math.round(d.totalPremium / d.totalUnits).toLocaleString()}`, sub: "Per unit/year" },
          { label: "Next Renewal", value: nextRenewal, sub: properties.find(p => p.renewal === nextRenewal)?.address || "" },
        ].map((k, i) => (
          <div key={i} className="bg-card border-2 border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
            <p className={`text-xl font-extrabold ${k.accent ? "text-accent" : "text-foreground"}`}>{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Property comparison table */}
      <div className="bg-card border-2 border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Property Comparison</h3>
          <button className="text-sm text-accent font-semibold hover:underline">Export</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Property", "Plan", "Units", "Premium", "Insured", "Occupancy", "Rent/mo", "Claims", "Renewal"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {properties.map(p => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="py-3 px-3">
                    <p className="font-semibold text-foreground">{p.address}</p>
                    <p className="text-xs text-muted-foreground">{p.id}</p>
                  </td>
                  <td className="py-3 px-3 text-foreground">{p.plan}</td>
                  <td className="py-3 px-3 text-foreground">{p.units}</td>
                  <td className="py-3 px-3 font-semibold text-foreground">${p.premium.toLocaleString()}</td>
                  <td className="py-3 px-3 text-foreground">${(p.insured / 1000).toLocaleString()}K</td>
                  <td className="py-3 px-3 text-foreground">{p.occupancy}</td>
                  <td className="py-3 px-3 text-foreground">${p.rent.toLocaleString()}</td>
                  <td className="py-3 px-3 text-foreground">{p.claims}</td>
                  <td className="py-3 px-3 text-foreground">{p.renewal}</td>
                </tr>
              ))}
              <tr className="bg-muted/30 font-semibold">
                <td className="py-3 px-3 text-foreground">Total</td>
                <td className="py-3 px-3"></td>
                <td className="py-3 px-3 text-foreground">{d.totalUnits}</td>
                <td className="py-3 px-3 text-foreground">${d.totalPremium.toLocaleString()}</td>
                <td className="py-3 px-3"></td>
                <td className="py-3 px-3"></td>
                <td className="py-3 px-3"></td>
                <td className="py-3 px-3"></td>
                <td className="py-3 px-3"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Renewal calendar */}
      <div className="bg-card border-2 border-border rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-foreground mb-4">Renewal Calendar</h3>
        <div className="space-y-3">
          {properties.map(p => (
            <div key={p.id} className="flex items-center gap-4 py-2">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <span className="text-xs font-bold text-accent">{new Date(p.renewal).toLocaleString("en", { month: "short" })}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{new Date(p.renewal).toLocaleString("en", { month: "long", year: "numeric" })}</p>
                <p className="text-xs text-muted-foreground">{p.id} — {p.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-card border-2 border-border rounded-2xl p-6">
        <h3 className="font-bold text-foreground mb-4">Portfolio Insights</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">✓</div>
            <div>
              <p className="text-sm font-semibold text-foreground">Low claims ratio</p>
              <p className="text-xs text-muted-foreground">Your {d.claimsRatio}% claims ratio is well below the 55-65% industry average. Favorable renewal pricing likely.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">!</div>
            <div>
              <p className="text-sm font-semibold text-foreground">Vacancy detected</p>
              <p className="text-xs text-muted-foreground">456 Dundas is at 75% occupancy. Ensure vacancy endorsement is active if any unit is 30+ days vacant.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">i</div>
            <div>
              <p className="text-sm font-semibold text-foreground">Coverage adequacy</p>
              <p className="text-xs text-muted-foreground">Insurance-to-rent ratio is {((d.totalPremium / (d.totalRent * 12)) * 100).toFixed(1)}% — within the healthy 3-8% range.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══ MAINTENANCE LOG ═══

export function LandlordMaintenance() {
  const [entries, setEntries] = useState(MOCK_MAINTENANCE);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState("all");
  const [newEntry, setNewEntry] = useState({ property: "", date: "", type: "", description: "", cost: "", contractor: "" });

  const totalSpent = entries.reduce((s, e) => s + e.cost, 0);
  const filtered = filter === "all" ? entries : entries.filter(e => e.property.includes(filter));

  const addEntry = () => {
    if (!newEntry.property || !newEntry.type || !newEntry.description) return;
    const impactMap: Record<string, string> = {
      Plumbing: "May reduce premium — updated plumbing reduces water damage risk",
      Electrical: "May reduce premium — modern electrical reduces fire risk",
      Roof: "New roof typically reduces premium 5-10% at renewal",
      HVAC: "May reduce premium — new equipment less prone to breakdown",
      Safety: "Monitored detection systems may qualify for safety discount",
    };
    setEntries(prev => [{
      id: `m${prev.length + 1}`,
      property: newEntry.property,
      date: newEntry.date || new Date().toISOString().split("T")[0],
      type: newEntry.type,
      description: newEntry.description,
      cost: Number(newEntry.cost) || 0,
      contractor: newEntry.contractor || "Not specified",
      premiumImpact: impactMap[newEntry.type] || "Impact will be assessed at renewal",
      hasReceipt: false,
    }, ...prev]);
    setNewEntry({ property: "", date: "", type: "", description: "", cost: "", contractor: "" });
    setShowAdd(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Maintenance Log</h1>
          <p className="text-sm text-muted-foreground">{entries.length} entries · ${totalSpent.toLocaleString()} invested</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border-2 border-border bg-background text-sm outline-none focus:border-accent appearance-none">
            <option value="all">All properties</option>
            <option value="123 Queen">123 Queen St W</option>
            <option value="456 Dundas">456 Dundas St E</option>
          </select>
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent/90">+ Log Maintenance</button>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-card border-2 border-border rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-foreground mb-4">Log Maintenance</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1">Property *</label>
              <select value={newEntry.property} onChange={e => setNewEntry(n => ({ ...n, property: e.target.value }))}
                className="w-full p-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-accent appearance-none">
                <option value="">Select</option>
                <option>123 Queen St W</option>
                <option>456 Dundas St E</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1">Type *</label>
              <select value={newEntry.type} onChange={e => setNewEntry(n => ({ ...n, type: e.target.value }))}
                className="w-full p-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-accent appearance-none">
                <option value="">Select</option>
                {MAINTENANCE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-sm font-semibold text-foreground block mb-1">Description *</label>
            <textarea value={newEntry.description} onChange={e => setNewEntry(n => ({ ...n, description: e.target.value }))}
              placeholder="What work was done?" rows={2}
              className="w-full p-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-accent resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1">Date</label>
              <input type="date" value={newEntry.date} onChange={e => setNewEntry(n => ({ ...n, date: e.target.value }))}
                className="w-full p-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1">Cost</label>
              <input value={newEntry.cost} onChange={e => setNewEntry(n => ({ ...n, cost: e.target.value }))} placeholder="$0"
                className="w-full p-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1">Contractor</label>
              <input value={newEntry.contractor} onChange={e => setNewEntry(n => ({ ...n, contractor: e.target.value }))} placeholder="Company"
                className="w-full p-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-accent" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={addEntry} className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-accent text-white hover:bg-accent/90">Save</button>
            <button onClick={() => setShowAdd(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold border-2 border-border hover:border-accent/40">Cancel</button>
          </div>
          <p className="text-xs text-muted-foreground mt-4 italic">
            Why log maintenance? Documented improvements are shared with your underwriter at renewal and can lower premiums. Roof, plumbing, and electrical upgrades have the highest impact.
          </p>
        </div>
      )}

      {/* Entries */}
      <div className="space-y-4">
        {filtered.map(e => (
          <div key={e.id} className="bg-card border-2 border-border rounded-2xl p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground font-semibold">{e.type}</span>
                <span className="text-xs text-muted-foreground">{e.date}</span>
              </div>
              <span className="font-bold text-foreground">${e.cost.toLocaleString()}</span>
            </div>
            <p className="text-sm text-foreground mb-1">{e.description}</p>
            <p className="text-xs text-muted-foreground mb-2">{e.property} · {e.contractor}</p>
            {e.hasReceipt && <p className="text-xs text-green-600 mb-1">✓ Receipt uploaded</p>}
            <p className="text-xs text-accent italic">Premium impact: {e.premiumImpact}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══ CLAIMS ═══

export function LandlordClaims() {
  const allClaims = POLICIES.flatMap(p => p.claims.map(c => ({ ...c, address: p.address })));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Claims</h1>
        <button onClick={() => window.location.href = "/claims"} className="px-4 py-2 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent/90">+ File a Claim</button>
      </div>
      {allClaims.length === 0 ? (
        <div className="bg-card border-2 border-border rounded-2xl p-8 text-center">
          <p className="text-muted-foreground">No claims filed across your policies.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allClaims.map(c => (
            <div key={c.id} className="bg-card border-2 border-border rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">{c.id}</p>
                <p className="text-xs text-muted-foreground">{c.address} · {c.type} · Filed {c.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={c.status} />
                <span className="text-sm font-bold text-foreground">${c.amount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══ DOCUMENTS ═══

export function LandlordDocuments() {
  const allDocs = POLICIES.flatMap(p => p.documents.map(d => ({ ...d, address: p.address })));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">All Documents</h1>
          <p className="text-sm text-muted-foreground">{allDocs.length} documents across {POLICIES.length} policies</p>
        </div>
      </div>
      <div className="space-y-3">
        {allDocs.map((d, i) => (
          <div key={i} className="bg-card border-2 border-border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DocIcon type={d.type} />
              <div>
                <p className="text-sm font-semibold text-foreground">{d.name}</p>
                <p className="text-xs text-muted-foreground">{d.address} · {d.date} · {d.size}</p>
              </div>
            </div>
            <button className="text-muted-foreground hover:text-accent">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══ BILLING ═══

export function LandlordBilling() {
  const totalAnnual = POLICIES.reduce((s, p) => s + p.premium, 0);
  const nextPaymentPolicy = POLICIES.reduce((min, p) => p.nextPayment < min.nextPayment ? p : min, POLICIES[0]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-foreground mb-6">Billing</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border-2 border-border rounded-xl p-5">
          <p className="text-xs text-muted-foreground mb-1">Total Annual Premium</p>
          <p className="text-2xl font-extrabold text-accent">${totalAnnual.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">${Math.round(totalAnnual / 12)}/mo across {POLICIES.length} policies</p>
        </div>
        <div className="bg-card border-2 border-border rounded-xl p-5">
          <p className="text-xs text-muted-foreground mb-1">Next Payment</p>
          <p className="text-2xl font-extrabold text-foreground">${nextPaymentPolicy.nextPaymentAmount}</p>
          <p className="text-xs text-muted-foreground">{nextPaymentPolicy.nextPayment} · {nextPaymentPolicy.id}</p>
        </div>
        <div className="bg-card border-2 border-border rounded-xl p-5">
          <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
          <p className="text-lg font-extrabold text-foreground">Visa ••4821</p>
          <button className="text-xs text-accent font-semibold hover:underline mt-1">Update</button>
        </div>
      </div>

      <div className="bg-card border-2 border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Policies & Payments</h3>
          <button className="text-sm text-accent font-semibold hover:underline">Download All Statements</button>
        </div>
        <div className="space-y-4">
          {POLICIES.map(p => (
            <div key={p.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-semibold text-foreground">{p.address}</p>
                <p className="text-xs text-muted-foreground">{p.id} · {p.plan}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">${p.premium.toLocaleString()}/yr</p>
                <p className="text-xs text-muted-foreground">{p.paymentFrequency}</p>
                <p className="text-xs text-muted-foreground">Next: {p.nextPayment} · ${p.nextPaymentAmount}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══ REFERRALS ═══

export function LandlordReferrals() {
  const r = REFERRAL_DATA;
  const [copied, setCopied] = useState(false);
  const bound = r.referrals.filter(ref => ref.status === "Bound").length;

  return (
    <div>
      {/* Hero */}
      <div className="bg-accent rounded-2xl p-8 text-white mb-8">
        <h1 className="text-2xl font-extrabold mb-2">Refer a friend, earn ${r.reward}</h1>
        <p className="text-sm opacity-90 mb-6">When they bind a policy, you both earn a ${r.reward} account credit.</p>

        <div className="mb-6">
          <p className="text-xs font-semibold opacity-70 mb-2">Your referral link</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white/20 rounded-lg px-4 py-3 text-sm font-mono">{r.link}</div>
            <button onClick={() => { navigator.clipboard?.writeText(r.link); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="px-5 py-2.5 rounded-lg bg-white text-accent font-semibold text-sm">
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { v: `$${r.balance}`, l: "Available Credit" },
            { v: `$${r.totalEarned}`, l: "Total Earned" },
            { v: String(bound), l: "Successful" },
          ].map((k, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-extrabold">{k.v}</p>
              <p className="text-xs opacity-70">{k.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {[
          { step: "1", title: "Share your link", desc: "Send to landlords or tenants in Ontario" },
          { step: "2", title: "They get a quote", desc: "Same instant quote experience" },
          { step: "3", title: `You both earn $${r.reward}`, desc: "Credit applied to next billing cycle" },
        ].map((s, i) => (
          <div key={i} className="text-center">
            <div className="w-10 h-10 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center mx-auto mb-3">{s.step}</div>
            <h3 className="text-sm font-bold text-foreground mb-1">{s.title}</h3>
            <p className="text-xs text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* History */}
      <div className="bg-card border-2 border-border rounded-2xl p-6">
        <h3 className="font-bold text-foreground mb-4">Referral History</h3>
        <div className="space-y-3">
          {r.referrals.map((ref, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  ref.status === "Bound" ? "bg-green-100 text-green-700" :
                  ref.status === "Quoted" ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {ref.status === "Bound" ? "✓" : ref.status === "Quoted" ? "⏳" : "✕"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{ref.name}</p>
                  <p className="text-xs text-muted-foreground">{ref.policyType} · {ref.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={ref.status} />
                {ref.reward > 0 && <span className="text-sm font-bold text-accent">+${ref.reward}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══ SETTINGS ═══

export function LandlordSettings() {
  const user = { firstName: "Marcus", lastName: "Chen", email: "marcus.chen@email.com", phone: "(416) 555-0147" };
  const [form, setForm] = useState(user);
  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-foreground mb-6">Account Settings</h1>

      <div className="bg-card border-2 border-border rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-foreground mb-4">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1">First Name</label>
            <input value={form.firstName} onChange={e => update("firstName", e.target.value)} placeholder="First name"
              className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1">Last Name</label>
            <input value={form.lastName} onChange={e => update("lastName", e.target.value)} placeholder="Last name"
              className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1">Email</label>
            <input value={form.email} onChange={e => update("email", e.target.value)} placeholder="email@example.com"
              className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1">Phone</label>
            <input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="(416) 555-0000"
              className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent" />
          </div>
        </div>
      </div>

      <div className="bg-card border-2 border-border rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-foreground mb-4">Password</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1">Current Password</label>
            <input type="password" placeholder="••••••••"
              className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1">New Password</label>
            <input type="password" placeholder="••••••••"
              className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent" />
          </div>
        </div>
        <button className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-accent text-white hover:bg-accent/90">Update Password</button>
      </div>

      <div className="bg-card border-2 border-border rounded-2xl p-6">
        <h3 className="font-bold text-foreground mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          {["Payment reminders", "Claim status updates", "Renewal notices", "Certificate requests", "Marketing & product updates"].map((n, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <span className="text-sm text-foreground">{n}</span>
              <button className="w-10 h-6 rounded-full bg-accent relative">
                <div className="w-4 h-4 rounded-full bg-white absolute top-1 right-1" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
