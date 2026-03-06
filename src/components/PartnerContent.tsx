import { useState } from "react";
import { Copy, Download, ExternalLink, Check, Filter, Plus, FileText, Mail, Image, Video, HelpCircle, Award } from "lucide-react";

// ═══════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════

const PARTNER = {
  company: "Apex Property Management",
  type: "Property Manager",
  since: "2025-06",
  tier: "Widget",
  contactName: "Jordan Williams",
  email: "jordan@apexpm.ca",
  phone: "(416) 555-0900",
  website: "https://apexpm.ca",
  province: "Ontario",
  city: "Toronto",
  bankAccount: "TD Bank ••••7291",
  referralLink: "https://cedar.ca/p/apex-pm",
  widgetCode: '<script src="https://cdn.cedar.ca/widget.js" data-partner="apex-pm"></script>',
  apiKey: "sk_live_apex_••••••••••••3f8a",
};

const STATS = {
  totalReferrals: 147,
  activePolicies: 118,
  conversionRate: 80.3,
  totalGWP: 167400,
  totalCommission: 28458,
  pendingCommission: 3240,
  mtdReferrals: 14,
  mtdPolicies: 11,
  mtdCommission: 2860,
  lifetimePayouts: 25218,
  payoutCount: 9,
  avgPerPolicy: 241,
};

const MONTHLY_DATA = [
  { month: "Mar 2026", referrals: 14, policies: 11, gwp: 16280, commission: 2860, status: "In progress" },
  { month: "Feb 2026", referrals: 22, policies: 18, gwp: 27540, commission: 4120, status: "Paid" },
  { month: "Jan 2026", referrals: 19, policies: 15, gwp: 22350, commission: 3540, status: "Paid" },
  { month: "Dec 2025", referrals: 16, policies: 13, gwp: 19110, commission: 2980, status: "Paid" },
  { month: "Nov 2025", referrals: 24, policies: 20, gwp: 31200, commission: 4680, status: "Paid" },
  { month: "Oct 2025", referrals: 18, policies: 14, gwp: 20580, commission: 3210, status: "Paid" },
  { month: "Sep 2025", referrals: 15, policies: 12, gwp: 16440, commission: 2640, status: "Paid" },
  { month: "Aug 2025", referrals: 10, policies: 8, gwp: 9200, commission: 2320, status: "Paid" },
  { month: "Jul 2025", referrals: 5, policies: 4, gwp: 3800, commission: 1260, status: "Paid" },
  { month: "Jun 2025", referrals: 4, policies: 3, gwp: 2900, commission: 848, status: "Paid" },
];

const ACTIVITY = [
  { date: "2026-03-04", event: "Policy bound", detail: "22 Elm St, Toronto — Standard — $1,680/yr", amount: 302, type: "bound" },
  { date: "2026-03-03", event: "Quote generated", detail: "88 Front St W — Client reviewing options", amount: null, type: "quote" },
  { date: "2026-03-02", event: "Policy bound", detail: "456 Dundas St E — Standard — $1,890/yr", amount: 340, type: "bound" },
  { date: "2026-03-01", event: "Renewal processed", detail: "789 King St — Auto-renewed — $1,155/yr", amount: 208, type: "renewal" },
  { date: "2026-02-28", event: "Quote generated", detail: "15 Maple Ave, Mississauga — Pending", amount: null, type: "quote" },
  { date: "2026-02-27", event: "Policy bound", detail: "15 Maple Ave — Premium — $3,210/yr", amount: 578, type: "bound" },
  { date: "2026-02-25", event: "Commission paid", detail: "February payout deposited", amount: 4120, type: "payout" },
  { date: "2026-02-24", event: "Quote generated", detail: "330 Bay St — Client reviewing", amount: null, type: "quote" },
  { date: "2026-02-22", event: "Policy bound", detail: "330 Bay St, Unit 2201 — Basic — $980/yr", amount: 176, type: "bound" },
  { date: "2026-02-20", event: "Renewal processed", detail: "123 Queen St W — Auto-renewed — $2,340/yr", amount: 421, type: "renewal" },
];

const PROPERTIES = [
  { address: "456 Dundas St E, Toronto", policyId: "CED-2025-003891", plan: "Standard", premium: 1890, commission: 340, status: "Active", bound: "2026-03-02", renewal: "2027-03-02" },
  { address: "123 Queen St W, Toronto", policyId: "CED-2025-001247", plan: "Standard", premium: 2340, commission: 421, status: "Active", bound: "2025-08-15", renewal: "2026-08-15" },
  { address: "15 Maple Ave, Mississauga", policyId: "CED-2026-001102", plan: "Premium", premium: 3210, commission: 578, status: "Active", bound: "2026-02-27", renewal: "2027-02-27" },
  { address: "789 King St, Hamilton", policyId: "CED-2025-005102", plan: "Basic", premium: 1155, commission: 208, status: "Active", bound: "2025-12-01", renewal: "2026-12-01" },
  { address: "330 Bay St, Unit 2201, Toronto", policyId: "CED-2026-000891", plan: "Basic", premium: 980, commission: 176, status: "Active", bound: "2026-02-22", renewal: "2027-02-22" },
  { address: "22 Elm St, Toronto", policyId: "CED-2026-001340", plan: "Standard", premium: 1680, commission: 302, status: "Active", bound: "2026-03-04", renewal: "2027-03-04" },
  { address: "88 Front St W, Toronto", policyId: "", plan: "", premium: 0, commission: 0, status: "Quoted", bound: "", renewal: "" },
];

const MARKETING_MATERIALS = [
  { id: "m1", name: "Co-Branded Flyer — Landlord", type: "PDF", desc: "One-page flyer for landlord clients. Customizable with your logo.", size: "2.4 MB", downloads: 34 },
  { id: "m2", name: "Co-Branded Flyer — Tenant", type: "PDF", desc: "One-page flyer for tenant clients. Customizable with your logo.", size: "2.1 MB", downloads: 12 },
  { id: "m3", name: "Email Template — New Client Introduction", type: "HTML", desc: "Ready-to-send email introducing Cedar insurance to your clients.", size: "48 KB", downloads: 56 },
  { id: "m4", name: "Email Template — Renewal Reminder", type: "HTML", desc: "Remind clients their insurance renewal is approaching.", size: "42 KB", downloads: 28 },
  { id: "m5", name: "Social Media Kit", type: "ZIP", desc: "Instagram, LinkedIn, and Facebook graphics with suggested copy.", size: "8.7 MB", downloads: 19 },
  { id: "m6", name: "Explainer Video — Landlord Insurance", type: "MP4", desc: "90-second video explaining landlord insurance. Embed on your site.", size: "45 MB", downloads: 8 },
  { id: "m7", name: "Client FAQ Sheet", type: "PDF", desc: "Common questions and answers your clients will ask about Cedar.", size: "890 KB", downloads: 41 },
  { id: "m8", name: "Partner Badge — Website", type: "PNG", desc: "'Cedar Authorized Partner' badge for your website.", size: "12 KB", downloads: 22 },
];

const API_ENDPOINTS = [
  { method: "POST", path: "/v1/quotes", desc: "Create a new quote" },
  { method: "GET", path: "/v1/quotes/:id", desc: "Retrieve a quote" },
  { method: "POST", path: "/v1/policies/bind", desc: "Bind a quoted policy" },
  { method: "GET", path: "/v1/policies/:id", desc: "Retrieve policy details" },
  { method: "POST", path: "/v1/policies/:id/certificate", desc: "Generate certificate of insurance" },
  { method: "GET", path: "/v1/policies/:id/documents", desc: "List policy documents" },
  { method: "PATCH", path: "/v1/policies/:id/endorse", desc: "Request policy endorsement" },
  { method: "POST", path: "/v1/policies/:id/cancel", desc: "Request cancellation" },
];

const WEBHOOK_EVENTS = [
  "quote.created", "quote.expired", "policy.bound", "policy.renewed",
  "policy.cancelled", "policy.endorsed", "claim.filed", "commission.earned",
];

const WEBHOOK_DELIVERIES = [
  { time: "Mar 4, 14:22", event: "policy.bound", status: "200 OK", success: true },
  { time: "Mar 3, 09:15", event: "quote.created", status: "200 OK", success: true },
  { time: "Mar 2, 16:40", event: "policy.bound", status: "200 OK", success: true },
  { time: "Mar 1, 11:20", event: "policy.renewed", status: "200 OK", success: true },
  { time: "Feb 28, 08:00", event: "quote.created", status: "500 Error", success: false },
];

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Active: "bg-green-100 text-green-800",
    Quoted: "bg-amber-100 text-amber-800",
    Paid: "bg-green-100 text-green-800",
    "In progress": "bg-blue-100 text-blue-800",
  };
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors[status] || "bg-muted text-muted-foreground"}`}>{status}</span>;
}

function MaterialIcon({ type }: { type: string }) {
  switch (type) {
    case "PDF": return <FileText size={18} className="text-red-500" />;
    case "HTML": return <Mail size={18} className="text-blue-500" />;
    case "ZIP": return <Image size={18} className="text-purple-500" />;
    case "MP4": return <Video size={18} className="text-pink-500" />;
    case "PNG": return <Award size={18} className="text-amber-500" />;
    default: return <FileText size={18} className="text-muted-foreground" />;
  }
}

// ═══════════════════════════════════════════════════
// REFERRALS
// ═══════════════════════════════════════════════════

export function PartnerReferrals() {
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? ACTIVITY : ACTIVITY.filter(a => a.type === filter);

  return (
    <div>
      {/* Referral link banner */}
      <div className="bg-accent rounded-2xl p-6 mb-8">
        <p className="text-white/80 text-sm mb-2">Share with clients or embed on your website</p>
        <div className="flex items-center gap-3">
          <code className="flex-1 bg-white/10 text-white px-4 py-3 rounded-lg text-sm font-mono truncate">{PARTNER.referralLink}</code>
          <button onClick={() => { navigator.clipboard?.writeText(PARTNER.referralLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="px-5 py-2.5 rounded-lg bg-white text-accent font-semibold text-sm flex items-center gap-2 hover:bg-white/90 transition-colors flex-shrink-0">
            {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Referrals", value: STATS.totalReferrals, sub: `${STATS.mtdReferrals} this month` },
          { label: "Conversion Rate", value: `${STATS.conversionRate}%`, sub: `${STATS.activePolicies} active policies` },
          { label: "MTD Referrals", value: STATS.mtdReferrals, sub: `${STATS.mtdPolicies} bound` },
          { label: "Pending Quotes", value: PROPERTIES.filter(p => p.status === "Quoted").length, sub: "Awaiting client decision" },
        ].map((k, i) => (
          <div key={i} className="bg-card border-2 border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
            <p className="text-2xl font-extrabold text-foreground">{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Activity feed */}
      <div className="bg-card border-2 border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Referral Activity</h3>
          <div className="flex gap-1">
            {["all", "bound", "quote", "renewal", "payout"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${filter === f ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground"}`}>
                {f === "all" ? "All" : f === "bound" ? "Bound" : f === "quote" ? "Quoted" : f === "renewal" ? "Renewals" : "Payouts"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-0">
          {filtered.map((a, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  a.type === "bound" ? "bg-green-100 text-green-700" :
                  a.type === "payout" ? "bg-accent/10 text-accent" :
                  a.type === "renewal" ? "bg-blue-100 text-blue-700" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {a.type === "bound" ? "✓" : a.type === "payout" ? "$" : a.type === "renewal" ? "↻" : "→"}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{a.event}</p>
                  <p className="text-xs text-muted-foreground">{a.detail}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{a.date}</p>
                {a.amount && <p className="text-sm font-bold text-accent">+${a.amount.toLocaleString()}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// COMMISSIONS
// ═══════════════════════════════════════════════════

export function PartnerCommissions() {
  return (
    <div>
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Commission", value: `$${STATS.totalCommission.toLocaleString()}`, sub: "Lifetime earned" },
          { label: "Pending", value: `$${STATS.pendingCommission.toLocaleString()}`, sub: "Next payout Mar 15" },
          { label: "Lifetime Payouts", value: `$${STATS.lifetimePayouts.toLocaleString()}`, sub: `${STATS.payoutCount} payouts` },
          { label: "Avg / Policy", value: `$${STATS.avgPerPolicy}`, sub: "Commission per policy" },
        ].map((k, i) => (
          <div key={i} className="bg-card border-2 border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
            <p className="text-2xl font-extrabold text-foreground">{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Next payout */}
      <div className="bg-accent/5 border-2 border-accent/20 rounded-2xl p-6 mb-8">
        <p className="text-sm text-muted-foreground mb-1">Next Payout</p>
        <p className="text-sm text-foreground mb-2">March 15, 2026 via EFT to {PARTNER.bankAccount}</p>
        <p className="text-3xl font-extrabold text-accent">${STATS.pendingCommission.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-1">{STATS.mtdPolicies} policies this month</p>
      </div>

      {/* Monthly breakdown */}
      <div className="bg-card border-2 border-border rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Monthly Commission Breakdown</h3>
          <button className="text-sm text-accent font-semibold hover:underline flex items-center gap-1">
            <Download size={14} /> Download All Statements
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Month</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">Referrals</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">Bound</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">GWP</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">Commission</th>
                <th className="text-center py-3 px-2 text-muted-foreground font-medium">Status</th>
                <th className="text-right py-3 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {MONTHLY_DATA.map((m, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="py-3 px-2 font-medium text-foreground">{m.month}</td>
                  <td className="py-3 px-2 text-right text-foreground">{m.referrals}</td>
                  <td className="py-3 px-2 text-right text-foreground">{m.policies}</td>
                  <td className="py-3 px-2 text-right text-foreground">${m.gwp.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right font-semibold text-foreground">${m.commission.toLocaleString()}</td>
                  <td className="py-3 px-2 text-center"><StatusBadge status={m.status} /></td>
                  <td className="py-3 px-2 text-right">
                    {m.status === "Paid" && (
                      <button className="text-xs text-accent font-semibold hover:underline">Statement</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border">
                <td className="py-3 px-2 font-bold text-foreground">Total</td>
                <td className="py-3 px-2 text-right font-bold text-foreground">{MONTHLY_DATA.reduce((s, m) => s + m.referrals, 0)}</td>
                <td className="py-3 px-2 text-right font-bold text-foreground">{MONTHLY_DATA.reduce((s, m) => s + m.policies, 0)}</td>
                <td className="py-3 px-2 text-right font-bold text-foreground">${MONTHLY_DATA.reduce((s, m) => s + m.gwp, 0).toLocaleString()}</td>
                <td className="py-3 px-2 text-right font-bold text-accent">${MONTHLY_DATA.reduce((s, m) => s + m.commission, 0).toLocaleString()}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Commission structure */}
      <div className="bg-card border-2 border-border rounded-2xl p-6">
        <h3 className="font-bold text-foreground mb-4">Your Commission Structure</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/30 rounded-xl p-5 text-center">
            <p className="text-sm text-muted-foreground mb-1">New Policy</p>
            <p className="text-3xl font-extrabold text-accent">18%</p>
            <p className="text-xs text-muted-foreground">of first-year premium</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-5 text-center">
            <p className="text-sm text-muted-foreground mb-1">Renewal</p>
            <p className="text-3xl font-extrabold text-accent">18%</p>
            <p className="text-xs text-muted-foreground">of renewal premium</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-5 text-center">
            <p className="text-sm text-muted-foreground mb-1">Payout Schedule</p>
            <p className="text-3xl font-extrabold text-foreground">15th</p>
            <p className="text-xs text-muted-foreground">of following month</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// PROPERTIES
// ═══════════════════════════════════════════════════

export function PartnerProperties() {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? PROPERTIES : PROPERTIES.filter(p => p.status === filter);
  const totalPremium = PROPERTIES.filter(p => p.premium).reduce((s, p) => s + p.premium, 0);
  const totalComm = PROPERTIES.filter(p => p.commission).reduce((s, p) => s + p.commission, 0);
  const activeCount = PROPERTIES.filter(p => p.status === "Active").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground">
            {filtered.length} referred properties · ${totalPremium.toLocaleString()} GWP · ${totalComm.toLocaleString()} commission
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {["all", "Active", "Quoted"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground"}`}>
                {f === "all" ? "All statuses" : f}
              </button>
            ))}
          </div>
          <button className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <Download size={14} /> Export CSV
          </button>
          <a href="/quote" className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors flex items-center gap-1">
            <Plus size={14} /> New Quote
          </a>
        </div>
      </div>

      <div className="bg-card border-2 border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Property</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Policy</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Plan</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Premium</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Commission</th>
                <th className="text-center py-3 px-4 text-muted-foreground font-medium">Status</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Bound</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Renewal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">{p.address}</td>
                  <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{p.policyId || "—"}</td>
                  <td className="py-3 px-4">{p.plan ? <span className="text-xs font-semibold bg-muted px-2 py-0.5 rounded">{p.plan}</span> : "—"}</td>
                  <td className="py-3 px-4 text-right text-foreground">{p.premium ? `$${p.premium.toLocaleString()}/yr` : "—"}</td>
                  <td className="py-3 px-4 text-right font-semibold text-foreground">{p.commission ? `$${p.commission}` : "—"}</td>
                  <td className="py-3 px-4 text-center"><StatusBadge status={p.status} /></td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">{p.bound || "—"}</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">{p.renewal || "—"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/20">
                <td className="py-3 px-4 font-bold text-foreground">{activeCount} active</td>
                <td colSpan={2}></td>
                <td className="py-3 px-4 text-right font-bold text-foreground">${totalPremium.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-bold text-accent">${totalComm.toLocaleString()}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MARKETING
// ═══════════════════════════════════════════════════

export function PartnerMarketing() {
  const categories = [
    { l: "Flyers & Print", count: 2, icon: "📄" },
    { l: "Email Templates", count: 2, icon: "✉️" },
    { l: "Digital Assets", count: 4, icon: "🎨" },
  ];

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-6">Co-branded resources to help you promote Cedar to your clients.</p>

      {/* Category summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {categories.map((c, i) => (
          <div key={i} className="bg-card border-2 border-border rounded-xl p-5 text-center">
            <div className="text-2xl mb-2">{c.icon}</div>
            <p className="font-bold text-foreground">{c.l}</p>
            <p className="text-xs text-muted-foreground">{c.count} resources</p>
          </div>
        ))}
      </div>

      {/* Materials list */}
      <div className="space-y-4">
        {MARKETING_MATERIALS.map(m => (
          <div key={m.id} className="bg-card border-2 border-border rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
              <MaterialIcon type={m.type} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">{m.type}</span>
              </div>
              <p className="font-semibold text-foreground">{m.name}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{m.desc}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>{m.size}</span>
                <span>{m.downloads} downloads</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button className="px-3 py-2 rounded-lg border-2 border-border text-sm font-medium text-foreground hover:bg-muted/30 transition-colors">Preview</button>
              <button className="px-3 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors flex items-center gap-1">
                <Download size={14} /> Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom materials CTA */}
      <div className="bg-accent/5 border-2 border-accent/20 rounded-2xl p-6 mt-8 text-center">
        <h3 className="font-bold text-foreground mb-2">Need custom materials?</h3>
        <p className="text-sm text-muted-foreground mb-4">We can create co-branded assets tailored to your specific client base and distribution channels.</p>
        <button className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors">
          Request Custom Materials
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// INTEGRATION
// ═══════════════════════════════════════════════════

export function PartnerIntegration() {
  const [activeTab, setActiveTab] = useState<"widget" | "api" | "webhooks">("widget");
  const [copiedWidget, setCopiedWidget] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [enabledEvents, setEnabledEvents] = useState<string[]>(["policy.bound", "quote.created", "commission.earned"]);

  const toggleEvent = (ev: string) => {
    setEnabledEvents(prev => prev.includes(ev) ? prev.filter(e => e !== ev) : [...prev, ev]);
  };

  return (
    <div>
      {/* Tier header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Current tier: <span className="font-semibold text-foreground">{PARTNER.tier}</span></p>
        </div>
        <button className="px-4 py-2 rounded-lg border-2 border-border text-sm font-semibold text-foreground hover:border-accent/40 transition-colors">
          Request Tier Upgrade
        </button>
      </div>

      {/* Tier overview */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { name: "Referral Link", desc: "Zero tech", current: false },
          { name: "Widget", desc: "One line of code", current: true },
          { name: "Full API", desc: "Developer integration", current: false },
        ].map((t, i) => (
          <div key={i} className={`bg-card border-2 rounded-xl p-5 text-center ${t.current ? "border-accent shadow-sm" : "border-border"}`}>
            {t.current && <span className="text-[10px] font-semibold text-accent mb-2 block">Current</span>}
            <p className="font-bold text-foreground">{t.name}</p>
            <p className="text-xs text-muted-foreground">{t.desc}</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-muted/30 rounded-xl p-1 mb-6 w-fit">
        {(["widget", "api", "webhooks"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {tab === "api" ? "API" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Widget tab */}
      {activeTab === "widget" && (
        <div className="space-y-8">
          {/* Embed code */}
          <div className="bg-card border-2 border-border rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-2">Widget Embed Code</h3>
            <p className="text-sm text-muted-foreground mb-4">Add this single line to your website's HTML to embed the Cedar quote widget. It will match your site's styling automatically.</p>
            <div className="bg-foreground/5 rounded-lg p-4 flex items-center justify-between">
              <code className="text-sm font-mono text-foreground break-all">{PARTNER.widgetCode}</code>
              <button onClick={() => { navigator.clipboard?.writeText(PARTNER.widgetCode); setCopiedWidget(true); setTimeout(() => setCopiedWidget(false), 2000); }}
                className="px-3 py-1.5 rounded-lg bg-muted text-foreground text-xs font-semibold hover:bg-muted/70 ml-4 flex-shrink-0">
                {copiedWidget ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Widget preview */}
          <div className="bg-card border-2 border-border rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-4">Widget Preview</h3>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="font-bold text-accent text-lg">CEDAR</span>
                <span className="text-muted-foreground">×</span>
                <span className="text-sm font-medium text-foreground">{PARTNER.company}</span>
              </div>
              <h4 className="text-lg font-bold text-foreground mb-2">Get a landlord insurance quote</h4>
              <p className="text-sm text-muted-foreground mb-4">Instant quote. 60 seconds. No commitment.</p>
              <button className="px-6 py-3 rounded-lg bg-accent text-white font-semibold hover:bg-accent/90 transition-colors">Quote</button>
              <p className="text-xs text-muted-foreground mt-4 italic">This is how the widget will appear on your website</p>
            </div>
          </div>

          {/* Config options */}
          <div className="bg-card border-2 border-border rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-4">Configuration Options</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Attribute</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Values</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { attr: "data-partner", val: "apex-pm", desc: "Your partner ID (required)" },
                    { attr: "data-type", val: "landlord | tenant | both", desc: "Coverage types to show (default: both)" },
                    { attr: "data-theme", val: "light | dark | auto", desc: "Widget color scheme (default: auto)" },
                    { attr: "data-prefill-address", val: "123 Main St...", desc: "Pre-fill the address field" },
                  ].map((r, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="py-2 px-3 font-mono text-xs text-accent">{r.attr}</td>
                      <td className="py-2 px-3 font-mono text-xs text-foreground">{r.val}</td>
                      <td className="py-2 px-3 text-muted-foreground">{r.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* API tab */}
      {activeTab === "api" && (
        <div className="space-y-8">
          {/* API Key */}
          <div className="bg-card border-2 border-border rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-2">API Key</h3>
            <p className="text-sm text-muted-foreground mb-4">Use this key to authenticate API requests. Keep it secret.</p>
            <div className="bg-foreground/5 rounded-lg p-4 flex items-center justify-between">
              <code className="text-sm font-mono text-foreground">{PARTNER.apiKey}</code>
              <button onClick={() => { setCopiedKey(true); setTimeout(() => setCopiedKey(false), 2000); }}
                className="px-3 py-1.5 rounded-lg bg-muted text-foreground text-xs font-semibold hover:bg-muted/70 ml-4 flex-shrink-0">
                {copiedKey ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Endpoints */}
          <div className="bg-card border-2 border-border rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-4">API Endpoints</h3>
            <div className="space-y-3">
              {API_ENDPOINTS.map((ep, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${ep.method === "POST" ? "bg-green-100 text-green-800" : ep.method === "GET" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}>
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono text-foreground">{ep.path}</code>
                  <span className="text-sm text-muted-foreground ml-auto">{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sandbox */}
          <div className="bg-card border-2 border-border rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-2">Sandbox Environment</h3>
            <p className="text-sm text-muted-foreground mb-4">Test your integration without creating real policies.</p>
            <div className="bg-foreground/5 rounded-lg p-4 mb-4">
              <p className="text-xs text-muted-foreground mb-1">Base URL</p>
              <code className="text-sm font-mono text-foreground">https://sandbox.api.cedar.ca/v1</code>
            </div>
            <div className="bg-foreground/5 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-2">Example: Create a quote</p>
              <code className="text-xs font-mono text-foreground whitespace-pre-wrap">{`curl -X POST https://sandbox.api.cedar.ca/v1/quotes \\
  -H "Authorization: Bearer sk_test_..."`}</code>
            </div>
            <button className="mt-4 text-sm text-accent font-semibold hover:underline flex items-center gap-1">
              View Full API Documentation <ExternalLink size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Webhooks tab */}
      {activeTab === "webhooks" && (
        <div className="space-y-8">
          {/* Webhook URL */}
          <div className="bg-card border-2 border-border rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-2">Webhook Configuration</h3>
            <p className="text-sm text-muted-foreground mb-4">Receive real-time notifications when events occur on your referred policies.</p>
            <div className="flex gap-3">
              <input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://your-domain.com/webhooks/cedar"
                className="flex-1 p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent text-sm" />
              <button className="px-5 py-3 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors">Save</button>
            </div>
          </div>

          {/* Events */}
          <div className="bg-card border-2 border-border rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-4">Events to subscribe</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {WEBHOOK_EVENTS.map(ev => (
                <label key={ev} className="flex items-center gap-2 p-3 rounded-lg bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
                  <input type="checkbox" checked={enabledEvents.includes(ev)} onChange={() => toggleEvent(ev)}
                    className="rounded border-border text-accent focus:ring-accent" />
                  <span className="text-sm font-mono text-foreground">{ev}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Payload example */}
          <div className="bg-card border-2 border-border rounded-2xl p-6">
            <h3 className="font-bold text-foreground mb-4">Webhook Payload Example</h3>
            <pre className="bg-foreground/5 rounded-lg p-4 text-xs font-mono text-foreground overflow-x-auto">{`{
  "event": "policy.bound",
  "timestamp": "2026-03-04T14:22:00Z",
  "data": {
    "policy_id": "CED-2026-001340",
    "partner_id": "apex-pm",
    "address": "22 Elm St, Toronto, ON",
    "plan": "Standard",
    "premium": 1680,
    "commission": 302,
    "effective_date": "2026-03-04",
    "type": "landlord"
  }
}`}</pre>
          </div>

          {/* Recent deliveries */}
          <div className="bg-card border-2 border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Recent Deliveries</h3>
              <button className="px-4 py-2 rounded-lg border-2 border-border text-sm font-semibold text-foreground hover:border-accent/40 transition-colors">
                Test Webhook
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Time</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Event</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">Success</th>
                  </tr>
                </thead>
                <tbody>
                  {WEBHOOK_DELIVERIES.map((d, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="py-2 px-3 text-muted-foreground">{d.time}</td>
                      <td className="py-2 px-3 font-mono text-xs text-foreground">{d.event}</td>
                      <td className="py-2 px-3">
                        <span className={`text-xs font-semibold ${d.success ? "text-green-600" : "text-red-600"}`}>{d.status}</span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {d.success ? <Check size={16} className="text-green-600 mx-auto" /> : <span className="text-red-600 text-xs font-bold">✕</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════

export function PartnerSettings() {
  const [form, setForm] = useState({
    company: PARTNER.company,
    website: PARTNER.website,
    province: PARTNER.province,
    city: PARTNER.city,
    contactName: PARTNER.contactName,
    email: PARTNER.email,
    phone: PARTNER.phone,
  });

  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    "New policy bound": true,
    "Quote generated": true,
    "Commission earned": true,
    "Renewal processed": true,
    "Monthly statement ready": true,
    "Product updates & news": false,
  });

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="max-w-2xl space-y-8">
      {/* Company info */}
      <div className="bg-card border-2 border-border rounded-2xl p-6">
        <h3 className="font-bold text-foreground mb-4">Company Information</h3>
        <div className="space-y-4">
          {[
            { label: "Company Name", key: "company" },
            { label: "Website", key: "website" },
            { label: "Province", key: "province" },
            { label: "City", key: "city" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-sm font-medium text-foreground mb-1 block">{f.label}</label>
              <input value={form[f.key as keyof typeof form]} onChange={e => update(f.key, e.target.value)}
                className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent" />
            </div>
          ))}
        </div>
      </div>

      {/* Primary contact */}
      <div className="bg-card border-2 border-border rounded-2xl p-6">
        <h3 className="font-bold text-foreground mb-4">Primary Contact</h3>
        <div className="space-y-4">
          {[
            { label: "Name", key: "contactName" },
            { label: "Email", key: "email" },
            { label: "Phone", key: "phone" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-sm font-medium text-foreground mb-1 block">{f.label}</label>
              <input value={form[f.key as keyof typeof form]} onChange={e => update(f.key, e.target.value)}
                className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent" />
            </div>
          ))}
        </div>
      </div>

      {/* Banking */}
      <div className="bg-card border-2 border-border rounded-2xl p-6">
        <h3 className="font-bold text-foreground mb-4">Banking Information</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Bank", value: "TD Canada Trust" },
            { label: "Account", value: PARTNER.bankAccount },
            { label: "Transit", value: "••••12" },
            { label: "Institution", value: "004" },
          ].map((b, i) => (
            <div key={i}>
              <p className="text-sm text-muted-foreground mb-1">{b.label}</p>
              <p className="font-medium text-foreground">{b.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Password */}
      <div className="bg-card border-2 border-border rounded-2xl p-6">
        <h3 className="font-bold text-foreground mb-4">Password</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Current Password</label>
            <input type="password" className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">New Password</label>
            <input type="password" className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent" />
          </div>
          <button className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors">
            Update Password
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card border-2 border-border rounded-2xl p-6">
        <h3 className="font-bold text-foreground mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          {Object.entries(notifications).map(([n, enabled]) => (
            <label key={n} className="flex items-center justify-between py-2 cursor-pointer">
              <span className="text-sm text-foreground">{n}</span>
              <button onClick={() => setNotifications(prev => ({ ...prev, [n]: !prev[n] }))}
                className={`w-10 h-6 rounded-full transition-colors relative ${enabled ? "bg-accent" : "bg-muted"}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${enabled ? "left-5" : "left-1"}`} />
              </button>
            </label>
          ))}
        </div>
      </div>

      <button className="w-full py-3 rounded-lg bg-accent text-white font-semibold hover:bg-accent/90 transition-colors">
        Save Changes
      </button>
    </div>
  );
}
