import { useState } from "react";

// ═══════════════════════════════════════════════════
// 1. NOTIFICATIONS CENTRE
// ═══════════════════════════════════════════════════

const MOCK_NOTIFICATIONS = [
  { id: "n1", type: "payment", title: "Payment due in 10 days", body: "Your monthly payment of $195.00 for CED-2025-001247 is due March 15.", date: "2026-03-05", read: false, action: "/portal/billing", actionLabel: "Make Payment" },
  { id: "n2", type: "claim", title: "Claim update — CLM-2025-00421", body: "Inspection has been scheduled for Nov 25, 2025 at 10:00 AM. Your adjuster Sarah Mitchell will be in touch to confirm.", date: "2026-03-04", read: false, action: "/claims", actionLabel: "View Claim" },
  { id: "n3", type: "certificate", title: "Certificate requested", body: "TD Bank — Mortgage Dept has requested an updated certificate of insurance for 123 Queen St W. You can send it directly from your dashboard.", date: "2026-03-03", read: false, action: null, actionLabel: "Send Certificate" },
  { id: "n4", type: "renewal", title: "Renewal notice — 456 Dundas St E", body: "Your Premium plan policy CED-2025-003891 renews on Oct 1, 2026. Review your updated terms and coverage options.", date: "2026-03-01", read: true, action: null, actionLabel: "Review Renewal" },
  { id: "n5", type: "payment", title: "Payment received", body: "We received your February payment of $195.00 for CED-2025-001247. Thank you!", date: "2026-02-15", read: true, action: null, actionLabel: null },
  { id: "n6", type: "policy", title: "Policy documents updated", body: "Your endorsement for sewer backup coverage on 123 Queen St W has been processed. Updated documents are available.", date: "2026-02-10", read: true, action: null, actionLabel: "View Documents" },
  { id: "n7", type: "referral", title: "Referral reward earned!", body: "Your referral to James Park has resulted in a bound policy. You've earned a $50 account credit.", date: "2026-02-08", read: true, action: null, actionLabel: "View Referrals" },
  { id: "n8", type: "system", title: "Welcome to Cedar", body: "Thanks for joining Cedar! Your policy is active and your certificate of insurance is ready to download.", date: "2025-08-15", read: true, action: null, actionLabel: null },
];

const NOTIF_ICONS: Record<string, { bg: string; icon: string }> = {
  payment: { bg: "bg-blue-100 text-blue-600", icon: "$" },
  claim: { bg: "bg-amber-100 text-amber-700", icon: "!" },
  certificate: { bg: "bg-green-100 text-green-600", icon: "📄" },
  renewal: { bg: "bg-purple-100 text-purple-600", icon: "↻" },
  policy: { bg: "bg-teal-100 text-teal-600", icon: "📋" },
  referral: { bg: "bg-pink-100 text-pink-600", icon: "🎁" },
  system: { bg: "bg-gray-100 text-gray-600", icon: "⚙" },
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 w-96 bg-background border-2 border-border rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-foreground">Notifications</h3>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-accent font-semibold hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[28rem] overflow-y-auto divide-y divide-border">
              {notifications.map((n) => {
                const style = NOTIF_ICONS[n.type] || NOTIF_ICONS.system;
                return (
                  <div key={n.id} onClick={() => markRead(n.id)}
                    className={`px-5 py-4 hover:bg-muted/20 transition-colors cursor-pointer ${!n.read ? "bg-accent/5" : ""}`}>
                    <div className="flex gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${style.bg}`}>
                        {style.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!n.read ? "font-bold text-foreground" : "font-medium text-foreground"}`}>{n.title}</p>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.body}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-muted-foreground">{n.date}</span>
                          {n.actionLabel && (
                            <button className="text-[11px] text-accent font-semibold hover:underline">{n.actionLabel}</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-3 border-t border-border text-center">
              <button className="text-xs text-accent font-semibold hover:underline">View All Notifications</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 2. RENEWAL MANAGEMENT
// ═══════════════════════════════════════════════════

const RENEWAL_DATA = {
  policyId: "CED-2025-003891",
  address: "456 Dundas St E, Toronto, ON",
  currentPlan: "Premium",
  currentPremium: 4250,
  newPremium: 4380,
  change: 130,
  changePercent: 3.1,
  effectiveDate: "2026-10-01",
  expiryDate: "2027-10-01",
  coverageChanges: [
    { name: "Dwelling", current: 680000, proposed: 700000, note: "Adjusted for construction cost inflation" },
    { name: "Liability", current: 5000000, proposed: 5000000, note: null },
    { name: "Loss of Rental Income", current: 156000, proposed: 162000, note: "Reflects updated rental income estimate" },
    { name: "Sewer & Water Backup", current: 100000, proposed: 100000, note: null },
    { name: "Equipment Breakdown", current: 200000, proposed: 200000, note: null },
  ],
  reasons: [
    "Dwelling coverage adjusted +2.9% for construction cost index",
    "Loss of rental income updated to reflect current market rents",
    "No claims on this policy — loyalty discount applied",
    "Ontario market rate adjustment: +1.8% industry-wide",
  ],
};

export function RenewalManagement({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"review" | "confirmed" | "declined">("review");
  const [selectedPlan, setSelectedPlan] = useState(RENEWAL_DATA.currentPlan);
  const r = RENEWAL_DATA;

  if (step === "confirmed") {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5" onClick={onClose}>
        <div className="bg-background rounded-2xl max-w-md w-full p-8 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Renewal Confirmed</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Your {selectedPlan} plan for {r.address} will renew automatically on {r.effectiveDate}.
          </p>
          <p className="text-lg font-extrabold text-accent mb-6">
            ${selectedPlan === "Premium" ? r.newPremium : selectedPlan === "Standard" ? Math.round(r.newPremium * 0.81) : Math.round(r.newPremium * 0.65)}/year
          </p>
          <button onClick={onClose} className="px-6 py-3 rounded-xl font-semibold border-2 border-border text-foreground hover:border-accent/40 transition-colors">Close</button>
        </div>
      </div>
    );
  }

  if (step === "declined") {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5" onClick={onClose}>
        <div className="bg-background rounded-2xl max-w-md w-full p-8 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Renewal Declined</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Your policy for {r.address} will expire on {r.effectiveDate}. Please ensure you have replacement coverage in place before that date.
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            Changed your mind? You can re-activate your renewal anytime before the expiry date.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setStep("review")} className="px-6 py-3 rounded-xl font-semibold bg-accent text-white hover:bg-accent/90 transition-colors">Re-activate Renewal</button>
            <button onClick={onClose} className="px-6 py-3 rounded-xl font-semibold border-2 border-border text-foreground hover:border-accent/40 transition-colors">Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5" onClick={onClose}>
      <div className="bg-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Renewal Review</h2>
            <p className="text-xs text-muted-foreground">{r.policyId} · {r.address}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Premium comparison */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card border-2 border-border rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Current Premium</p>
              <p className="text-2xl font-extrabold text-foreground">${r.currentPremium.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">/year</p>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mx-auto mb-1 text-muted-foreground">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
                <p className={`text-sm font-bold ${r.change > 0 ? "text-amber-600" : "text-green-600"}`}>
                  {r.change > 0 ? "+" : ""}${r.change}/yr
                </p>
                <p className="text-[10px] text-muted-foreground">({r.change > 0 ? "+" : ""}{r.changePercent}%)</p>
              </div>
            </div>
            <div className="bg-accent/10 border-2 border-accent/30 rounded-xl p-4 text-center">
              <p className="text-xs text-accent mb-1">Renewal Premium</p>
              <p className="text-2xl font-extrabold text-accent">${r.newPremium.toLocaleString()}</p>
              <p className="text-xs text-accent/60">/year (${Math.round(r.newPremium / 12)}/mo)</p>
            </div>
          </div>

          {/* Coverage changes */}
          <div>
            <h3 className="font-bold text-foreground mb-3">Coverage Changes</h3>
            <div className="space-y-2">
              {r.coverageChanges.map((c, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    {c.note && <p className="text-xs text-muted-foreground">{c.note}</p>}
                  </div>
                  <div className="text-right">
                    {c.current !== c.proposed ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground line-through">${c.current.toLocaleString()}</span>
                        <span className="text-sm font-bold text-accent">${c.proposed.toLocaleString()}</span>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-foreground">${c.current.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reasons */}
          <div className="bg-muted/20 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-foreground mb-2">Why did my premium change?</h4>
            <div className="space-y-2">
              {r.reasons.map((reason, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground mt-0.5">•</span>
                  <p className="text-xs text-muted-foreground">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Plan options */}
          <div>
            <h3 className="font-bold text-foreground mb-3">Want to change plans?</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { plan: "Basic", price: Math.round(r.newPremium * 0.65), features: ["Named perils", "$1M liability", "12 mo rental income"] },
                { plan: "Standard", price: Math.round(r.newPremium * 0.81), features: ["Broad form", "$2M liability", "18 mo rental income", "Sewer backup"] },
                { plan: "Premium", price: r.newPremium, features: ["All-risk", "$5M liability", "24 mo rental income", "Sewer backup", "Equipment breakdown", "Identity theft"] },
              ].map((opt) => (
                <button key={opt.plan} onClick={() => setSelectedPlan(opt.plan)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    selectedPlan === opt.plan ? "border-accent bg-accent/10" : "border-border hover:border-accent/30"
                  }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-foreground">{opt.plan}</p>
                    {opt.plan === r.currentPlan && <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-semibold">Current</span>}
                  </div>
                  <p className="text-lg font-extrabold text-accent">${opt.price.toLocaleString()}<span className="text-xs font-normal text-accent/60">/yr</span></p>
                  <p className="text-[10px] text-muted-foreground mb-2">${Math.round(opt.price / 12)}/mo</p>
                  <div className="space-y-1">
                    {opt.features.map((f, j) => (
                      <p key={j} className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="hsl(var(--accent))" /><polyline points="16 8 10 14 8 12" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" /></svg>
                        {f}
                      </p>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => setStep("confirmed")}
              className="flex-1 bg-accent text-white py-4 rounded-xl font-semibold hover:bg-accent/90 transition-colors">
              Confirm Renewal — {selectedPlan} Plan
            </button>
            <button onClick={() => setStep("declined")}
              className="px-6 py-4 rounded-xl font-semibold border-2 border-red-200 text-red-600 hover:bg-red-50 transition-colors">
              Decline
            </button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Renewal effective {r.effectiveDate}. Your current coverage continues unchanged until then.
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 3. MULTI-PROPERTY PORTFOLIO VIEW
// ═══════════════════════════════════════════════════

const PORTFOLIO_DATA = {
  summary: {
    totalProperties: 2, totalUnits: 6, totalPremium: 6590, totalInsuredValue: 1105000,
    totalClaimsOpen: 1, totalClaimsPaid: 3200, avgClaimsRatio: 2.1,
    nextRenewal: "2026-08-15", nextRenewalAddress: "123 Queen St W",
  },
  properties: [
    { id: "CED-2025-001247", address: "123 Queen St W, Toronto", plan: "Standard", status: "Active", premium: 2340, insuredValue: 425000, units: 2, openClaims: 1, renewalDate: "2026-08-15", occupancy: "100%", monthlyRent: 3900 },
    { id: "CED-2025-003891", address: "456 Dundas St E, Toronto", plan: "Premium", status: "Active", premium: 4250, insuredValue: 680000, units: 4, openClaims: 0, renewalDate: "2026-10-01", occupancy: "75%", monthlyRent: 6500 },
  ],
  renewalCalendar: [
    { month: "Aug 2026", count: 1, policies: ["CED-2025-001247 — 123 Queen St W"] },
    { month: "Oct 2026", count: 1, policies: ["CED-2025-003891 — 456 Dundas St E"] },
  ],
};

export function PortfolioView() {
  const d = PORTFOLIO_DATA;
  return (
    <div>
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Total Premium", value: `$${d.summary.totalPremium.toLocaleString()}`, sub: `$${Math.round(d.summary.totalPremium / 12)}/mo`, accent: true },
          { label: "Insured Value", value: `$${(d.summary.totalInsuredValue / 1000).toLocaleString()}K`, sub: `${d.summary.totalProperties} properties, ${d.summary.totalUnits} units`, accent: false },
          { label: "Claims Ratio", value: `${d.summary.avgClaimsRatio}%`, sub: `${d.summary.totalClaimsOpen} open, $${d.summary.totalClaimsPaid.toLocaleString()} paid`, accent: false },
          { label: "Avg Cost / Unit", value: `$${Math.round(d.summary.totalPremium / d.summary.totalUnits).toLocaleString()}`, sub: "Per unit per year", accent: false },
          { label: "Next Renewal", value: d.summary.nextRenewal, sub: d.summary.nextRenewalAddress, accent: false },
        ].map((kpi, i) => (
          <div key={i} className={`rounded-xl p-4 border-2 ${kpi.accent ? "bg-accent text-white border-accent" : "bg-card border-border"}`}>
            <p className={`text-xs mb-1 ${kpi.accent ? "text-white/70" : "text-muted-foreground"}`}>{kpi.label}</p>
            <p className={`text-xl font-extrabold ${kpi.accent ? "text-white" : "text-foreground"}`}>{kpi.value}</p>
            <p className={`text-xs mt-0.5 ${kpi.accent ? "text-white/60" : "text-muted-foreground"}`}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Properties comparison */}
      <div className="bg-card border-2 border-border rounded-2xl overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground">Property Comparison</h3>
          <button className="text-xs text-accent font-semibold hover:underline">Export Report</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                {["Property", "Plan", "Units", "Premium", "Insured Value", "Occupancy", "Monthly Rent", "Claims", "Renewal"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground p-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.properties.map((p, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/10">
                  <td className="p-3"><p className="text-sm font-medium text-foreground">{p.address}</p><p className="text-[10px] text-muted-foreground">{p.id}</p></td>
                  <td className="p-3"><span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-semibold">{p.plan}</span></td>
                  <td className="p-3 text-sm text-foreground">{p.units}</td>
                  <td className="p-3 text-sm font-semibold text-foreground">${p.premium.toLocaleString()}</td>
                  <td className="p-3 text-sm text-foreground">${p.insuredValue.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`text-sm font-medium ${p.occupancy === "100%" ? "text-green-600" : "text-amber-600"}`}>{p.occupancy}</span>
                  </td>
                  <td className="p-3 text-sm text-foreground">${p.monthlyRent.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.openClaims > 0 ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>
                      {p.openClaims > 0 ? `${p.openClaims} open` : "None"}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{p.renewalDate}</td>
                </tr>
              ))}
              <tr className="bg-muted/20 font-semibold">
                <td className="p-3 text-sm text-foreground">Portfolio Total</td>
                <td className="p-3"></td>
                <td className="p-3 text-sm text-foreground">{d.summary.totalUnits}</td>
                <td className="p-3 text-sm text-accent">${d.summary.totalPremium.toLocaleString()}</td>
                <td className="p-3 text-sm text-foreground">${d.summary.totalInsuredValue.toLocaleString()}</td>
                <td className="p-3"></td>
                <td className="p-3 text-sm text-foreground">${d.properties.reduce((s, p) => s + p.monthlyRent, 0).toLocaleString()}</td>
                <td className="p-3"></td>
                <td className="p-3"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Renewal calendar + Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border-2 border-border rounded-xl p-5">
          <h3 className="font-bold text-foreground mb-4">Renewal Calendar</h3>
          <div className="space-y-3">
            {d.renewalCalendar.map((r, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">
                  {r.month.split(" ")[0].slice(0, 3)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{r.month} — {r.count} {r.count === 1 ? "policy" : "policies"}</p>
                  {r.policies.map((p, j) => (
                    <p key={j} className="text-xs text-muted-foreground">{p}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border-2 border-border rounded-xl p-5">
          <h3 className="font-bold text-foreground mb-4">Portfolio Insights</h3>
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-green-800">Low claims ratio</p>
              <p className="text-xs text-green-700">Your {d.summary.avgClaimsRatio}% claims ratio is well below the industry average of 55-65%. This positions you for favorable renewal pricing.</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-amber-800">Vacancy detected</p>
              <p className="text-xs text-amber-700">456 Dundas St E is at 75% occupancy. Ensure your vacancy endorsement is active if any unit has been vacant 30+ days.</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-800">Coverage adequacy</p>
              <p className="text-xs text-blue-700">Your insurance-to-rent ratio is {((d.summary.totalPremium / (d.properties.reduce((s, p) => s + p.monthlyRent, 0) * 12)) * 100).toFixed(1)}% of annual rental income — within the healthy 3-8% range.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 4. MAINTENANCE LOG
// ═══════════════════════════════════════════════════

const MOCK_MAINTENANCE = [
  { id: "m1", property: "123 Queen St W", date: "2026-02-15", type: "Plumbing", description: "Replaced main stack and all copper supply lines with PEX", cost: 12500, contractor: "GTA Plumbing Solutions", premiumImpact: "May reduce premium at renewal — updated plumbing reduces water damage risk", hasReceipt: true },
  { id: "m2", property: "123 Queen St W", date: "2025-12-01", type: "Electrical", description: "Full panel upgrade from 100A to 200A with arc-fault breakers", cost: 4800, contractor: "Volt Electric", premiumImpact: "May reduce premium — modern electrical reduces fire risk", hasReceipt: true },
  { id: "m3", property: "456 Dundas St E", date: "2025-11-15", type: "Roof", description: "Full roof replacement — modified bitumen, 20-year warranty", cost: 18000, contractor: "Toronto Roofing Co.", premiumImpact: "New roof typically reduces premium 5-10% at renewal", hasReceipt: true },
  { id: "m4", property: "123 Queen St W", date: "2025-09-20", type: "HVAC", description: "Installed new high-efficiency furnace (96% AFUE) and AC unit", cost: 7200, contractor: "Comfort Air HVAC", premiumImpact: "May reduce premium — new equipment less prone to breakdown", hasReceipt: false },
  { id: "m5", property: "456 Dundas St E", date: "2025-08-10", type: "Safety", description: "Installed interconnected smoke/CO detectors in all units + hallways", cost: 1200, contractor: "Self-installed", premiumImpact: "Monitored detection systems may qualify for safety discount", hasReceipt: true },
];

const MAINTENANCE_TYPES = ["Plumbing", "Electrical", "Roof", "HVAC", "Safety", "Foundation", "Windows / Doors", "Exterior", "Appliances", "General Repair", "Other"];

export function MaintenanceLog() {
  const [entries, setEntries] = useState(MOCK_MAINTENANCE);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState("all");
  const [newEntry, setNewEntry] = useState({ property: "", date: "", type: "", description: "", cost: "", contractor: "" });

  const totalSpent = entries.reduce((s, e) => s + e.cost, 0);
  const filtered = filter === "all" ? entries : entries.filter((e) => e.property.includes(filter));

  const addEntry = () => {
    if (!newEntry.property || !newEntry.type || !newEntry.description) return;
    const impact = newEntry.type === "Roof" ? "New roof typically reduces premium 5-10% at renewal"
      : newEntry.type === "Plumbing" ? "Updated plumbing may reduce water damage risk premium"
      : newEntry.type === "Electrical" ? "Modern electrical may reduce fire risk premium"
      : newEntry.type === "Safety" ? "Safety improvements may qualify for discount"
      : "Documented maintenance supports favorable renewal pricing";
    setEntries((e) => [{
      id: `m${Date.now()}`, property: newEntry.property, date: newEntry.date || "2026-03-05",
      type: newEntry.type, description: newEntry.description,
      cost: parseInt(newEntry.cost) || 0, contractor: newEntry.contractor || "Not specified",
      premiumImpact: impact, hasReceipt: false,
    }, ...e]);
    setNewEntry({ property: "", date: "", type: "", description: "", cost: "", contractor: "" });
    setShowAdd(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {entries.length} entries · ${totalSpent.toLocaleString()} total invested
        </p>
        <div className="flex gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-accent appearance-none cursor-pointer">
            <option value="all">All properties</option>
            <option value="123 Queen">123 Queen St W</option>
            <option value="456 Dundas">456 Dundas St E</option>
          </select>
          <button onClick={() => setShowAdd(!showAdd)}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-accent text-white hover:bg-accent/90 transition-colors flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Log Maintenance
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-card border-2 border-accent/30 rounded-xl p-5 mb-4">
          <h3 className="font-bold text-foreground mb-4">Log Maintenance or Improvement</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Property *</label>
              <select value={newEntry.property} onChange={(e) => setNewEntry((n) => ({ ...n, property: e.target.value }))}
                className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-accent appearance-none cursor-pointer">
                <option value="" disabled>Select property</option>
                <option value="123 Queen St W">123 Queen St W, Toronto</option>
                <option value="456 Dundas St E">456 Dundas St E, Toronto</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Type *</label>
              <select value={newEntry.type} onChange={(e) => setNewEntry((n) => ({ ...n, type: e.target.value }))}
                className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-accent appearance-none cursor-pointer">
                <option value="" disabled>Select type</option>
                {MAINTENANCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs font-semibold text-foreground mb-1">Description *</label>
            <textarea value={newEntry.description} onChange={(e) => setNewEntry((n) => ({ ...n, description: e.target.value }))}
              placeholder="What work was done? Include materials, scope, and any warranty info."
              rows={2} className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-accent resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Date</label>
              <input type="date" value={newEntry.date} onChange={(e) => setNewEntry((n) => ({ ...n, date: e.target.value }))}
                className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Cost</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={newEntry.cost} onChange={(e) => setNewEntry((n) => ({ ...n, cost: e.target.value }))}
                  placeholder="0" className="w-full pl-7 p-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-accent" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Contractor</label>
              <input value={newEntry.contractor} onChange={(e) => setNewEntry((n) => ({ ...n, contractor: e.target.value }))}
                placeholder="Company name" className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground text-sm outline-none focus:border-accent" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addEntry} className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-accent text-white hover:bg-accent/90 transition-colors">Save Entry</button>
            <button onClick={() => setShowAdd(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold border-2 border-border text-foreground hover:border-accent/40 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-4 flex items-start gap-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5 text-accent">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <p className="text-xs text-accent">
          <strong>Why log maintenance?</strong> Documented property improvements are shared with your underwriter at renewal and can result in lower premiums. Roof replacements, plumbing upgrades, and electrical modernization have the highest impact. Keep receipts — we'll attach them to your renewal file.
        </p>
      </div>

      <div className="space-y-3">
        {filtered.map((e) => (
          <div key={e.id} className="bg-card border-2 border-border rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-muted/50 text-muted-foreground px-2 py-0.5 rounded-full">{e.type}</span>
                  <span className="text-xs text-muted-foreground">{e.date}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{e.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{e.property} · {e.contractor}</p>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className="text-lg font-bold text-foreground">${e.cost.toLocaleString()}</p>
                {e.hasReceipt && <span className="text-[10px] text-green-600 font-semibold">Receipt uploaded</span>}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-2.5">
              <p className="text-xs text-green-700"><strong>Premium impact:</strong> {e.premiumImpact}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 5. REFERRAL PROGRAM
// ═══════════════════════════════════════════════════

const MOCK_REFERRAL = {
  code: "MARCUS50", link: "https://cedar.ca/r/MARCUS50", reward: 50, balance: 100, totalEarned: 250,
  referrals: [
    { name: "James Park", status: "Bound", date: "2026-02-08", reward: 50, policyType: "Landlord" },
    { name: "Sarah Lin", status: "Bound", date: "2026-01-15", reward: 50, policyType: "Tenant" },
    { name: "David Thompson", status: "Bound", date: "2025-12-20", reward: 50, policyType: "Landlord" },
    { name: "Amy Rodriguez", status: "Quoted", date: "2026-02-28", reward: null, policyType: "Landlord" },
    { name: "Kevin Nguyen", status: "Quoted", date: "2026-03-01", reward: null, policyType: "Tenant" },
    { name: "Lisa Chen", status: "Expired", date: "2025-11-01", reward: null, policyType: "Landlord" },
  ],
};

export function ReferralProgram() {
  const [copied, setCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const r = MOCK_REFERRAL;

  const copyLink = () => {
    navigator.clipboard?.writeText(r.link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bound = r.referrals.filter((x) => x.status === "Bound").length;
  const pending = r.referrals.filter((x) => x.status === "Quoted").length;

  return (
    <div>
      {/* Hero card */}
      <div className="bg-accent rounded-2xl p-8 text-white mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-extrabold mb-2">Refer a friend, earn ${r.reward}</h2>
            <p className="text-white/80 mb-5">
              Share your referral link with other landlords or tenants. When they bind a policy, you both earn a ${r.reward} account credit.
            </p>
            <div className="bg-white/10 rounded-xl p-3 flex items-center gap-3 mb-4">
              <div className="flex-1 bg-white/10 rounded-lg px-4 py-2.5">
                <p className="text-xs text-white/60 mb-0.5">Your referral link</p>
                <p className="text-sm font-mono font-semibold">{r.link}</p>
              </div>
              <button onClick={copyLink}
                className="px-5 py-2.5 rounded-lg bg-white text-accent font-semibold text-sm hover:bg-white/90 transition-colors flex-shrink-0">
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowShareOptions(!showShareOptions)}
                className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors">
                Share via...
              </button>
            </div>
            {showShareOptions && (
              <div className="flex gap-2 mt-3">
                {["Email", "Text", "WhatsApp", "Copy Message"].map((m) => (
                  <button key={m} className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors">
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-3xl font-extrabold">${r.balance}</p>
              <p className="text-xs text-white/60 mt-1">Available Credit</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-3xl font-extrabold">${r.totalEarned}</p>
              <p className="text-xs text-white/60 mt-1">Total Earned</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-3xl font-extrabold">{bound}</p>
              <p className="text-xs text-white/60 mt-1">Successful</p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { step: "1", title: "Share your link", desc: "Send your unique referral link to friends, family, or colleagues who own or rent property in Ontario." },
          { step: "2", title: "They get a quote", desc: "Your referral gets the same great Cedar experience — instant quotes, transparent pricing, and easy binding." },
          { step: "3", title: `You both earn $${r.reward}`, desc: `Once they bind a policy, you each receive a $${r.reward} account credit applied to your next billing cycle.` },
        ].map((s, i) => (
          <div key={i} className="bg-card border-2 border-border rounded-xl p-5 text-center">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white text-sm font-bold mb-3">{s.step}</div>
            <h3 className="font-bold text-foreground mb-1">{s.title}</h3>
            <p className="text-xs text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Referral history */}
      <div className="bg-card border-2 border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground">Referral History</h3>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{bound} bound</span>
            <span>{pending} pending</span>
            <span>{r.referrals.length} total</span>
          </div>
        </div>
        <div className="divide-y divide-border">
          {r.referrals.map((ref, i) => (
            <div key={i} className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                  ref.status === "Bound" ? "bg-green-100 text-green-600" :
                  ref.status === "Quoted" ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500"
                }`}>
                  {ref.status === "Bound" ? "✓" : ref.status === "Quoted" ? "⏳" : "✕"}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{ref.name}</p>
                  <p className="text-xs text-muted-foreground">{ref.policyType} · {ref.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  ref.status === "Bound" ? "bg-green-100 text-green-800" :
                  ref.status === "Quoted" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"
                }`}>{ref.status}</span>
                {ref.reward && (
                  <span className="text-sm font-bold text-accent">+${ref.reward}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terms */}
      <div className="mt-4 bg-muted/20 rounded-xl p-4">
        <p className="text-xs text-muted-foreground">
          <strong>Terms:</strong> Referral credits are applied to your account within 5 business days of the referred policy binding. Credits can be applied to any Cedar premium payment and are non-transferable. There is no limit to the number of referrals you can make. Referred individuals must be new to Cedar and bind a policy within 30 days of their initial quote.
        </p>
      </div>
    </div>
  );
}
