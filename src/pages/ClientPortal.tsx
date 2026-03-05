import { useState, useCallback } from "react";

// ═══ MOCK DATA ═══
const MOCK_USER = {
  firstName: "Marcus",
  lastName: "Chen",
  email: "marcus.chen@email.com",
  phone: "(416) 555-0147",
  accountSince: "2025-08",
};

const MOCK_POLICIES = [
  {
    id: "CED-2025-001247",
    address: "123 Queen St W, Toronto, ON M5H 2M9",
    type: "landlord",
    plan: "Standard",
    status: "Active",
    effectiveDate: "2025-08-15",
    expiryDate: "2026-08-15",
    premium: 2340,
    paymentFrequency: "monthly",
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
    type: "landlord",
    plan: "Premium",
    status: "Active",
    effectiveDate: "2025-10-01",
    expiryDate: "2026-10-01",
    premium: 4250,
    paymentFrequency: "annual",
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
      { name: "Premium Plan Endorsement", type: "endorsement", date: "2025-10-01", size: "72 KB" },
      { name: "Annual Payment Receipt", type: "receipt", date: "2025-10-01", size: "42 KB" },
    ],
    claims: [],
  },
];

const AVAILABLE_COVERAGES = [
  { id: "sewer", name: "Sewer & Water Backup", desc: "Covers damage from sewer backup, sump pump failure, or overland water", startingAt: 120, popular: true },
  { id: "equipment", name: "Equipment Breakdown", desc: "Mechanical/electrical breakdown of HVAC, boilers, water heaters", startingAt: 85, popular: true },
  { id: "identity", name: "Identity Theft Protection", desc: "Covers expenses to restore identity including legal fees and lost wages", startingAt: 45, popular: false },
  { id: "overland", name: "Overland Water / Flood", desc: "Rising water from rivers, lakes, or extreme rainfall events", startingAt: 200, popular: false },
  { id: "vacancy", name: "Vacancy Endorsement", desc: "Maintains coverage during extended vacancy beyond 30 days", startingAt: 150, popular: false },
  { id: "legal", name: "Legal Expense Coverage", desc: "Legal costs for tenant disputes, eviction proceedings, lease enforcement", startingAt: 95, popular: true },
  { id: "guaranteed", name: "Guaranteed Replacement Cost", desc: "Full rebuild cost even if it exceeds your dwelling coverage limit", startingAt: 175, popular: false },
  { id: "bylaw", name: "Building Bylaw Coverage", desc: "Covers additional cost to rebuild to current building code standards", startingAt: 60, popular: false },
];

// ═══ HELPERS ═══
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-green-100 text-green-800",
    "Renewal Due": "bg-amber-100 text-amber-800",
    "In Review": "bg-amber-100 text-amber-800",
    Settled: "bg-green-100 text-green-800",
    Expired: "bg-red-100 text-red-800",
    Cancelled: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

function DocIcon({ type }: { type: string }) {
  const colors: Record<string, string> = {
    declaration: "bg-blue-100 text-blue-600",
    policy: "bg-purple-100 text-purple-600",
    certificate: "bg-green-100 text-green-600",
    endorsement: "bg-amber-100 text-amber-600",
    receipt: "bg-gray-100 text-gray-600",
  };
  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[type] || "bg-muted"}`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    </div>
  );
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date("2026-03-05");
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ═══ SHARE POLICY MODAL ═══
function ShareModal({ policy, onClose }: { policy: any; onClose: () => void }) {
  const [method, setMethod] = useState<"email" | "download">("email");
  const [docType, setDocType] = useState("certificate");
  const [recipients, setRecipients] = useState([{ name: "", email: "", type: "Landlord" }]);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");

  const updateRecipient = (i: number, key: string, val: string) => {
    setRecipients((r) => r.map((rec, idx) => (idx === i ? { ...rec, [key]: val } : rec)));
  };

  const addRecipient = () => {
    if (recipients.length < 5) {
      setRecipients((r) => [...r, { name: "", email: "", type: "Other" }]);
    }
  };

  const removeRecipient = (i: number) => {
    if (recipients.length > 1) setRecipients((r) => r.filter((_, idx) => idx !== i));
  };

  const canSend = method === "download" || recipients.every((r) => r.email);

  if (sent) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5" onClick={onClose}>
        <div className="bg-background rounded-2xl max-w-md w-full p-8 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            {method === "email" ? "Sent Successfully" : "Downloaded"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {method === "email"
              ? `Your ${docType === "certificate" ? "certificate of insurance" : "policy document"} has been emailed to ${recipients.length} recipient${recipients.length > 1 ? "s" : ""}.`
              : "Your document has been downloaded."}
          </p>
          <button onClick={onClose} className="px-6 py-3 rounded-xl font-semibold border-2 border-border text-foreground hover:border-accent/40 transition-colors">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5" onClick={onClose}>
      <div className="bg-background rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Share Policy Documents</h2>
            <p className="text-xs text-muted-foreground">{policy.id} — {policy.address}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Method toggle */}
          <div className="flex gap-3">
            <button onClick={() => setMethod("email")}
              className={`flex-1 p-3 rounded-lg border-2 text-sm font-semibold transition-all text-center ${
                method === "email" ? "border-accent bg-accent/10 text-accent" : "border-border text-foreground hover:border-accent/30"
              }`}>Email Directly</button>
            <button onClick={() => setMethod("download")}
              className={`flex-1 p-3 rounded-lg border-2 text-sm font-semibold transition-all text-center ${
                method === "download" ? "border-accent bg-accent/10 text-accent" : "border-border text-foreground hover:border-accent/30"
              }`}>Download PDF</button>
          </div>

          {/* Document type */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Document to share</label>
            <div className="space-y-2">
              {[
                { value: "certificate", label: "Certificate of Insurance", desc: "Proof of coverage — most commonly requested" },
                { value: "declaration", label: "Declarations Page", desc: "Coverage summary with limits and deductibles" },
                { value: "policy", label: "Full Policy Wording", desc: "Complete policy terms and conditions" },
              ].map((d) => (
                <button key={d.value} onClick={() => setDocType(d.value)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    docType === d.value ? "border-accent bg-accent/10" : "border-border hover:border-accent/30"
                  }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{d.label}</p>
                      <p className="text-xs text-muted-foreground">{d.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      docType === d.value ? "border-accent bg-accent" : "border-muted-foreground/30"
                    }`}>
                      {docType === d.value && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recipients (email only) */}
          {method === "email" && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Send to</label>
              <div className="space-y-3">
                {recipients.map((r, i) => (
                  <div key={i} className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <select value={r.type} onChange={(e) => updateRecipient(i, "type", e.target.value)}
                        className="p-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-accent transition-colors appearance-none cursor-pointer">
                        {["Landlord", "Mortgage Lender", "Property Manager", "Condo Corp", "Real Estate Agent", "Other"].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                      {recipients.length > 1 && (
                        <button onClick={() => removeRecipient(i)} className="ml-auto text-muted-foreground hover:text-red-500 transition-colors">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input value={r.name} onChange={(e) => updateRecipient(i, "name", e.target.value)}
                        placeholder="Recipient name"
                        className="p-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-accent transition-colors" />
                      <input value={r.email} onChange={(e) => updateRecipient(i, "email", e.target.value)}
                        placeholder="Email address *"
                        className="p-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-accent transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
              {recipients.length < 5 && (
                <button onClick={addRecipient} className="flex items-center gap-2 text-sm text-accent font-medium mt-3 hover:underline">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add another recipient
                </button>
              )}
              <div className="mt-3">
                <label className="block text-xs text-muted-foreground mb-1">Personal message (optional)</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Hi — attached is my proof of insurance as requested."
                  rows={2}
                  className="w-full p-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-accent transition-colors resize-none" />
              </div>
            </div>
          )}

          {/* Action */}
          <button onClick={() => setSent(true)} disabled={!canSend}
            className="w-full bg-accent text-white py-4 rounded-xl font-semibold hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {method === "email" ? (
              <>
                Send
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </>
            ) : (
              <>
                Download PDF
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══ ADD COVERAGE MODAL ═══
function AddCoverageModal({ policy, onClose }: { policy: any; onClose: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const existingCoverageNames = policy.coverages.map((c: any) => c.name.toLowerCase());

  const available = AVAILABLE_COVERAGES.filter(
    (ac) => !existingCoverageNames.some((n: string) => n.includes(ac.name.toLowerCase().split(" ")[0]))
  );

  const toggle = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const totalAdditional = selected.reduce((sum, id) => {
    const cov = AVAILABLE_COVERAGES.find((c) => c.id === id);
    return sum + (cov?.startingAt || 0);
  }, 0);

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5" onClick={onClose}>
        <div className="bg-background rounded-2xl max-w-md w-full p-8 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Coverage Request Submitted</h3>
          <p className="text-sm text-muted-foreground mb-4">
            We'll review your request and send you an updated quote within 1 business day. Your existing coverage remains unchanged until you approve the endorsement.
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            {selected.length} coverage{selected.length > 1 ? "s" : ""} requested · Estimated additional: ~${totalAdditional}/year
          </p>
          <button onClick={onClose}
            className="px-6 py-3 rounded-xl font-semibold border-2 border-border text-foreground hover:border-accent/40 transition-colors">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5" onClick={onClose}>
      <div className="bg-background rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Add Coverage</h2>
            <p className="text-xs text-muted-foreground">{policy.id} — {policy.plan} Plan</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {available.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Your {policy.plan} plan already includes all available coverages.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Select additional coverages to add to your policy. We'll send you an updated quote for approval.
              </p>
              <div className="space-y-2">
                {available.map((cov) => (
                  <button key={cov.id} onClick={() => toggle(cov.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selected.includes(cov.id) ? "border-accent bg-accent/10" : "border-border hover:border-accent/30"
                    }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground text-sm">{cov.name}</p>
                          {cov.popular && (
                            <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-semibold">Popular</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{cov.desc}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-accent">+${cov.startingAt}</p>
                        <p className="text-[10px] text-muted-foreground">/year est.</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end mt-2">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selected.includes(cov.id) ? "border-accent bg-accent" : "border-muted-foreground/30"
                      }`}>
                        {selected.includes(cov.id) && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {selected.length > 0 && (
                <div className="mt-5 bg-accent/5 border border-accent/20 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-accent">{selected.length} coverage{selected.length > 1 ? "s" : ""} selected</p>
                    <p className="text-xs text-accent/60">Estimated additional premium</p>
                  </div>
                  <p className="text-xl font-extrabold text-accent">~${totalAdditional}/yr</p>
                </div>
              )}

              <button onClick={() => setSubmitted(true)} disabled={selected.length === 0}
                className="w-full mt-4 bg-accent text-white py-4 rounded-xl font-semibold hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                Request Coverage Update
              </button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                No charges until you review and approve the updated premium.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══ POLICY DETAIL VIEW ═══
function PolicyDetail({ policy, onBack, onShare, onAddCoverage }: {
  policy: any; onBack: () => void; onShare: () => void; onAddCoverage: () => void;
}) {
  const [tab, setTab] = useState<"overview" | "documents" | "coverages" | "billing">("overview");
  const daysToRenewal = daysUntil(policy.expiryDate);
  const daysToPayment = daysUntil(policy.nextPayment);

  return (
    <div>
      {/* Back + header */}
      <button onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
        </svg>
        All Policies
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-extrabold text-foreground">{policy.address}</h1>
            <StatusBadge status={policy.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {policy.id} · {policy.plan} Plan · {policy.propertyType} · {policy.units} unit{policy.units > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onShare}
            className="px-4 py-2.5 rounded-lg border-2 border-border text-sm font-medium text-foreground hover:border-accent/40 transition-colors flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share
          </button>
          <button onClick={onAddCoverage}
            className="px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Coverage
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card border-2 border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Annual Premium</p>
          <p className="text-2xl font-extrabold text-foreground">${policy.premium.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">${Math.round(policy.premium / 12).toLocaleString()}/mo</p>
        </div>
        <div className="bg-card border-2 border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Next Payment</p>
          <p className="text-2xl font-extrabold text-foreground">${policy.nextPaymentAmount}</p>
          <p className="text-xs text-muted-foreground">in {daysToPayment} days</p>
        </div>
        <div className="bg-card border-2 border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Renewal</p>
          <p className="text-2xl font-extrabold text-foreground">{daysToRenewal}</p>
          <p className="text-xs text-muted-foreground">days remaining</p>
        </div>
        <div className="bg-card border-2 border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Active Claims</p>
          <p className="text-2xl font-extrabold text-foreground">{policy.claims.length}</p>
          <p className="text-xs text-muted-foreground">{policy.claims.length === 0 ? "No open claims" : "In progress"}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6 w-fit">
        {(["overview", "coverages", "documents", "billing"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}>{t}</button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div className="grid grid-cols-2 gap-6">
          {/* Property details */}
          <div className="bg-card border-2 border-border rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-4">Property Details</h3>
            <div className="space-y-3">
              {[
                { label: "Address", value: policy.address },
                { label: "Property Type", value: policy.propertyType },
                { label: "Units", value: policy.units },
                { label: "Year Built", value: policy.yearBuilt },
                { label: "Square Footage", value: `${policy.sqft.toLocaleString()} sq ft` },
              ].map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Policy info */}
          <div className="bg-card border-2 border-border rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-4">Policy Info</h3>
            <div className="space-y-3">
              {[
                { label: "Policy Number", value: policy.id },
                { label: "Plan", value: policy.plan },
                { label: "Effective Date", value: policy.effectiveDate },
                { label: "Expiry Date", value: policy.expiryDate },
                { label: "Payment", value: policy.paymentFrequency === "monthly" ? `Monthly ($${policy.nextPaymentAmount}/mo)` : `Annual ($${policy.premium.toLocaleString()})` },
              ].map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Insured */}
          <div className="bg-card border-2 border-border rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-4">Additional Insured Parties</h3>
            {policy.additionalInsureds.length === 0 ? (
              <p className="text-sm text-muted-foreground">No additional insured parties on this policy.</p>
            ) : (
              <div className="space-y-3">
                {policy.additionalInsureds.map((ai: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">{ai.name}</p>
                      <p className="text-xs text-muted-foreground">{ai.type} · Added {ai.added}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Claims */}
          <div className="bg-card border-2 border-border rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-4">Claims</h3>
            {policy.claims.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">No claims on this policy.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {policy.claims.map((cl: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">{cl.type}</p>
                      <p className="text-xs text-muted-foreground">{cl.id} · Filed {cl.date}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={cl.status} />
                      <p className="text-xs text-muted-foreground mt-1">${cl.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "coverages" && (
        <div className="bg-card border-2 border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-foreground">Coverage Summary — {policy.plan} Plan</h3>
            <button onClick={onAddCoverage} className="text-sm text-accent font-medium hover:underline flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Coverage
            </button>
          </div>
          <div className="divide-y divide-border">
            {policy.coverages.map((cov: any, i: number) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground text-sm">{cov.name}</p>
                  {cov.detail && <p className="text-xs text-muted-foreground">{cov.detail}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">
                    {cov.limit ? `$${cov.limit.toLocaleString()}` : cov.detail || "Included"}
                  </p>
                  {cov.deductible > 0 && (
                    <p className="text-xs text-muted-foreground">${cov.deductible.toLocaleString()} deductible</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "documents" && (
        <div className="bg-card border-2 border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-bold text-foreground">Policy Documents</h3>
          </div>
          <div className="divide-y divide-border">
            {policy.documents.map((doc: any, i: number) => (
              <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <DocIcon type={doc.type} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.date} · {doc.size}</p>
                  </div>
                </div>
                <button className="text-accent hover:underline text-sm font-medium">Download</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "billing" && (
        <div className="space-y-6">
          <div className="bg-card border-2 border-border rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-4">Payment Summary</h3>
            <div className="space-y-3">
              {[
                { label: "Annual Premium", value: `$${policy.premium.toLocaleString()}` },
                { label: "Payment Frequency", value: policy.paymentFrequency === "monthly" ? "Monthly" : "Annual" },
                { label: "Next Payment", value: `$${policy.nextPaymentAmount} on ${policy.nextPayment}` },
                { label: "Payment Method", value: "Visa ending in 4829" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border-2 border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-bold text-foreground">Payment History</h3>
            </div>
            <div className="divide-y divide-border">
              {policy.documents.filter((d: any) => d.type === "receipt").map((doc: any, i: number) => (
                <div key={i} className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DocIcon type="receipt" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-foreground">${policy.nextPaymentAmount}</span>
                    <button className="text-accent hover:underline text-sm font-medium">Download</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══ MAIN CLIENT PORTAL ═══
export default function ClientPortal() {
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [sharePolicy, setSharePolicy] = useState<any>(null);
  const [addCoveragePolicy, setAddCoveragePolicy] = useState<any>(null);

  const handleLogout = useCallback(() => {
    window.location.href = "/";
  }, []);

  // Dashboard view
  if (!selectedPolicy) {
    return (
      <div className="min-h-screen bg-background font-sans">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-border sticky top-0 bg-background z-20">
          <div className="text-xl font-extrabold tracking-[0.3em] text-accent cursor-pointer"
            onClick={() => { window.location.href = "/"; }}>CEDAR</div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{MOCK_USER.firstName} {MOCK_USER.lastName}</p>
              <p className="text-xs text-muted-foreground">{MOCK_USER.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <span className="text-sm font-bold text-accent">{MOCK_USER.firstName[0]}{MOCK_USER.lastName[0]}</span>
            </div>
            <button onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-2">
              Log Out
            </button>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-5 py-10">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-foreground mb-1">
              Welcome back, {MOCK_USER.firstName}
            </h1>
            <p className="text-muted-foreground">Here's an overview of your insurance portfolio.</p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-card border-2 border-border rounded-xl p-5">
              <p className="text-xs text-muted-foreground mb-1">Active Policies</p>
              <p className="text-3xl font-extrabold text-accent">{MOCK_POLICIES.length}</p>
            </div>
            <div className="bg-card border-2 border-border rounded-xl p-5">
              <p className="text-xs text-muted-foreground mb-1">Total Premium</p>
              <p className="text-3xl font-extrabold text-foreground">
                ${MOCK_POLICIES.reduce((s, p) => s + p.premium, 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">/year</p>
            </div>
            <div className="bg-card border-2 border-border rounded-xl p-5">
              <p className="text-xs text-muted-foreground mb-1">Total Coverage</p>
              <p className="text-3xl font-extrabold text-foreground">
                ${(MOCK_POLICIES.reduce((s, p) => s + (p.coverages[0]?.limit || 0), 0) / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-muted-foreground">dwelling</p>
            </div>
            <div className="bg-card border-2 border-border rounded-xl p-5">
              <p className="text-xs text-muted-foreground mb-1">Open Claims</p>
              <p className="text-3xl font-extrabold text-foreground">
                {MOCK_POLICIES.reduce((s, p) => s + p.claims.length, 0)}
              </p>
            </div>
          </div>

          {/* Policy cards */}
          <h2 className="text-lg font-bold text-foreground mb-4">Your Policies</h2>
          <div className="space-y-4">
            {MOCK_POLICIES.map((policy) => {
              const daysToRenewal = daysUntil(policy.expiryDate);
              return (
                <div key={policy.id}
                  className="bg-card border-2 border-border rounded-2xl overflow-hidden hover:border-accent/30 transition-all cursor-pointer"
                  onClick={() => setSelectedPolicy(policy)}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-foreground">{policy.address}</h3>
                          <StatusBadge status={policy.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {policy.id} · {policy.plan} Plan · {policy.propertyType} · {policy.units} unit{policy.units > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-extrabold text-foreground">${Math.round(policy.premium / 12)}</p>
                        <p className="text-xs text-muted-foreground">/month</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Dwelling</p>
                        <p className="text-sm font-semibold text-foreground">${(policy.coverages[0]?.limit || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Liability</p>
                        <p className="text-sm font-semibold text-foreground">${((policy.coverages[1]?.limit || 0) / 1000000).toFixed(0)}M</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Renewal</p>
                        <p className="text-sm font-semibold text-foreground">{daysToRenewal} days</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Claims</p>
                        <p className="text-sm font-semibold text-foreground">{policy.claims.length} active</p>
                      </div>
                    </div>
                  </div>

                  {policy.claims.length > 0 && (
                    <div className="border-t border-border bg-amber-50 px-6 py-3 flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <p className="text-xs text-amber-800 font-medium">
                        Claim {policy.claims[0].id} ({policy.claims[0].type}) — {policy.claims[0].status}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick actions */}
          <div className="mt-10">
            <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Get Certificate", desc: "Download or email instantly", icon: "📄" },
                { label: "File a Claim", desc: "Report an incident", icon: "🛡️", href: "/claims" },
                { label: "Add Property", desc: "Insure another property", icon: "🏠", href: "/quote" },
                { label: "Get Support", desc: "Contact our team", icon: "💬", href: "/support" },
              ].map((action, i) => (
                <a key={i} href={action.href || "#"}
                  className="bg-card border-2 border-border rounded-2xl p-5 text-center hover:border-accent/40 hover:shadow-sm transition-all group">
                  <div className="text-2xl mb-2">{action.icon}</div>
                  <h3 className="font-bold text-foreground text-sm mb-1">{action.label}</h3>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border py-8 px-8 mt-10">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="text-sm font-extrabold tracking-[0.3em] text-accent">CEDAR</div>
            <p className="text-xs text-muted-foreground">
              Cedar Insurance is a managing general agency. Coverage is underwritten by A-rated Canadian carriers.
              Available in Ontario. Terms and conditions apply.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // Policy detail view
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-border sticky top-0 bg-background z-20">
        <div className="text-xl font-extrabold tracking-[0.3em] text-accent cursor-pointer"
          onClick={() => { window.location.href = "/"; }}>CEDAR</div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">{MOCK_USER.firstName} {MOCK_USER.lastName}</p>
            <p className="text-xs text-muted-foreground">{MOCK_USER.email}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
            <span className="text-sm font-bold text-accent">{MOCK_USER.firstName[0]}{MOCK_USER.lastName[0]}</span>
          </div>
          <button onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-2">
            Log Out
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-10">
        <PolicyDetail
          policy={selectedPolicy}
          onBack={() => setSelectedPolicy(null)}
          onShare={() => setSharePolicy(selectedPolicy)}
          onAddCoverage={() => setAddCoveragePolicy(selectedPolicy)}
        />
      </div>

      {/* Modals */}
      {sharePolicy && <ShareModal policy={sharePolicy} onClose={() => setSharePolicy(null)} />}
      {addCoveragePolicy && <AddCoverageModal policy={addCoveragePolicy} onClose={() => setAddCoveragePolicy(null)} />}

      {/* Footer */}
      <footer className="border-t border-border py-8 px-8 mt-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="text-sm font-extrabold tracking-[0.3em] text-accent">CEDAR</div>
          <p className="text-xs text-muted-foreground">
            Cedar Insurance is a managing general agency. Coverage is underwritten by A-rated Canadian carriers.
            Available in Ontario. Terms and conditions apply.
          </p>
        </div>
      </footer>
    </div>
  );
}