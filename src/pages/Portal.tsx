import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell, RenewalManagement, PortfolioView, MaintenanceLog, ReferralProgram } from "@/components/PortalFeatures";
import cedarLogo from "@/assets/cedar-logo.png";
import {
  BarChart3, FileText, Building2, Wrench, Shield, FolderOpen, CreditCard,
  Gift, Settings, Package, Users, DollarSign, Home, Megaphone, Zap,
  LayoutGrid, HelpCircle, Link2
} from "lucide-react";

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

type PortalType = "landlord" | "tenant" | "partner";

// ═══════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════

const MOCK_USERS: Record<PortalType, any> = {
  landlord: {
    firstName: "Marcus", lastName: "Chen", email: "marcus.chen@email.com",
    phone: "(416) 555-0147", accountType: "landlord", accountSince: "2025-08",
    properties: 2, activePolicies: 2,
  },
  tenant: {
    firstName: "Priya", lastName: "Sharma", email: "priya.sharma@email.com",
    phone: "(647) 555-0283", accountType: "tenant", accountSince: "2025-09",
    unit: "45 Charles St E, Unit 1204", activePolicies: 1,
  },
  partner: {
    firstName: "Jordan", lastName: "Williams", email: "jordan@apexpm.ca",
    phone: "(416) 555-0900", accountType: "partner", accountSince: "2025-06",
    company: "Apex Property Management", partnerType: "Property Manager",
    activePolicies: 118, totalGWP: 167400,
  },
};

const NAV_ITEMS: Record<PortalType, { id: string; label: string; icon: React.ReactNode }[]> = {
  landlord: [
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 size={18} /> },
    { id: "policies", label: "My Policies", icon: <FileText size={18} /> },
    { id: "portfolio", label: "Portfolio", icon: <Building2 size={18} /> },
    { id: "maintenance", label: "Maintenance", icon: <Wrench size={18} /> },
    { id: "claims", label: "Claims", icon: <Shield size={18} /> },
    { id: "documents", label: "Documents", icon: <FolderOpen size={18} /> },
    { id: "billing", label: "Billing", icon: <CreditCard size={18} /> },
    { id: "referrals", label: "Referrals", icon: <Users size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  ],
  tenant: [
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 size={18} /> },
    { id: "policy", label: "My Policy", icon: <FileText size={18} /> },
    { id: "inventory", label: "Contents Inventory", icon: <Package size={18} /> },
    { id: "claims", label: "Claims", icon: <Shield size={18} /> },
    { id: "documents", label: "Documents", icon: <FolderOpen size={18} /> },
    { id: "billing", label: "Billing", icon: <CreditCard size={18} /> },
    { id: "referrals", label: "Referrals", icon: <Gift size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  ],
  partner: [
    { id: "dashboard", label: "Overview", icon: <LayoutGrid size={18} /> },
    { id: "referrals", label: "Referrals", icon: <Link2 size={18} /> },
    { id: "commissions", label: "Commissions", icon: <DollarSign size={18} /> },
    { id: "properties", label: "Properties", icon: <Home size={18} /> },
    { id: "marketing", label: "Marketing", icon: <Megaphone size={18} /> },
    { id: "integration", label: "Integration", icon: <Zap size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  ],
};

// ═══════════════════════════════════════════════════
// PORTAL TYPE SELECTOR
// ═══════════════════════════════════════════════════

function PortalTypeSelector({ onSelect }: { onSelect: (type: PortalType) => void }) {
  const portalTypes = [
    {
      type: "landlord" as PortalType,
      title: "Landlord Portal",
      desc: "Manage your rental property policies, track claims, log maintenance, and view your portfolio.",
      features: ["Policy management", "Portfolio dashboard", "Maintenance log", "Certificate sharing"],
      color: "bg-green-100 text-green-700",
    },
    {
      type: "tenant" as PortalType,
      title: "Tenant Portal",
      desc: "View your policy, share your certificate with your landlord, track your belongings, and manage billing.",
      features: ["Certificate sharing", "Contents inventory", "Coverage adjustment", "Roommate management"],
      color: "bg-blue-100 text-blue-700",
    },
    {
      type: "partner" as PortalType,
      title: "Partner Portal",
      desc: "Track referrals, view commissions, manage your integration, and access marketing materials.",
      features: ["Commission tracking", "Referral analytics", "Marketing resources", "API documentation"],
      color: "bg-purple-100 text-purple-700",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <a href="/">
            <img src={cedarLogo} alt="Cedar Insurance" className="h-10 mx-auto mb-4" />
          </a>
          <h1 className="text-2xl font-extrabold text-foreground font-serif">Welcome to your portal</h1>
          <p className="text-sm text-muted-foreground mt-1">Select your account type to continue.</p>
        </div>

        <div className="space-y-4">
          {portalTypes.map((p) => (
            <button
              key={p.type}
              onClick={() => onSelect(p.type)}
              className="w-full bg-card border-2 border-border rounded-2xl p-6 text-left hover:border-accent/50 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${p.color} flex items-center justify-center text-xl flex-shrink-0`}>
                  {p.type === "landlord" ? "🏠" : p.type === "tenant" ? "🔑" : "🤝"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground">{p.title}</h3>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-muted-foreground group-hover:text-accent transition-colors">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {p.features.map((f, i) => (
                      <span key={i} className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Don't have an account?{" "}
          <a href="/quote" className="text-accent font-semibold hover:underline">Get a quote</a>
          {" "}to create one automatically, or{" "}
          <a href="/partners" className="text-accent font-semibold hover:underline">apply as a partner</a>.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════

function PortalSidebar({
  type, activeNav, onNav, user, onLogout, collapsed, onToggle,
}: {
  type: PortalType; activeNav: string; onNav: (id: string) => void;
  user: any; onLogout: () => void; collapsed: boolean; onToggle: () => void;
}) {
  const items = NAV_ITEMS[type];
  const typeLabels: Record<PortalType, string> = { landlord: "Landlord Portal", tenant: "Tenant Portal", partner: "Partner Portal" };
  const typeBadge: Record<PortalType, string> = { landlord: "bg-green-100 text-green-800", tenant: "bg-blue-100 text-blue-800", partner: "bg-purple-100 text-purple-800" };

  return (
    <aside className={`${collapsed ? "w-16" : "w-64"} bg-card border-r border-border flex flex-col transition-all duration-200 flex-shrink-0`}>
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <div>
            <a href="/">
              <img src={cedarLogo} alt="Cedar" className="h-7 mb-1" />
            </a>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeBadge[type]}`}>
              {typeLabels[type]}
            </span>
          </div>
        )}
        <button onClick={onToggle} className="text-muted-foreground hover:text-foreground transition-colors p-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {collapsed ? <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></> : <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>}
          </svg>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            title={collapsed ? item.label : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeNav === item.id
                ? "bg-accent/10 text-accent"
                : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-border">
        {!collapsed ? (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-accent">{user.firstName[0]}{user.lastName[0]}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <button onClick={onLogout} className="w-full text-sm text-muted-foreground hover:text-foreground py-2 rounded-lg hover:bg-muted/30 transition-colors">
              Sign Out
            </button>
          </>
        ) : (
          <button onClick={onLogout} title="Sign Out" className="w-full flex justify-center text-muted-foreground hover:text-foreground py-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════
// PLACEHOLDER SECTION
// ═══════════════════════════════════════════════════

function PlaceholderSection({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-muted-foreground">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// DASHBOARD CONTENT RENDERERS
// ═══════════════════════════════════════════════════

function LandlordDashboard({ user, onNav }: { user: any; onNav: (id: string) => void }) {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-foreground mb-1">Welcome back, {user.firstName}</h1>
      <p className="text-sm text-muted-foreground mb-6">{user.properties} properties · {user.activePolicies} active policies</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Premium", value: "$6,590", sub: "$549/mo", accent: true },
          { label: "Properties", value: "2", sub: "6 total units" },
          { label: "Open Claims", value: "1", sub: "In review" },
          { label: "Next Renewal", value: "164d", sub: "Aug 15, 2026" },
        ].map((k, i) => (
          <div key={i} className="bg-card border-2 border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
            <p className={`text-2xl font-extrabold ${k.accent ? "text-accent" : "text-foreground"}`}>{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Get Certificate", icon: "📄", nav: "documents" },
          { label: "File a Claim", icon: "🛡️", nav: "claims" },
          { label: "Log Maintenance", icon: "🔧", nav: "maintenance" },
          { label: "Add Property", icon: "➕", href: "/quote" },
        ].map((qa, i) => (
          <button key={i} onClick={() => qa.href ? window.location.href = qa.href : onNav(qa.nav!)}
            className="bg-card border-2 border-border rounded-2xl p-5 text-center hover:border-accent/40 hover:shadow-sm transition-all">
            <div className="text-2xl mb-2">{qa.icon}</div>
            <p className="font-bold text-foreground text-sm">{qa.label}</p>
          </button>
        ))}
      </div>

      <div className="bg-card border-2 border-border rounded-2xl p-6">
        <h3 className="font-bold text-foreground mb-4">Recent Activity</h3>
        {[
          { date: "Mar 2", event: "Payment received — $195.00", icon: "$" },
          { date: "Mar 1", event: "Claim update — inspection scheduled for CLM-2025-00421", icon: "!" },
          { date: "Feb 28", event: "Certificate sent to TD Bank — Mortgage Dept", icon: "📄" },
          { date: "Feb 15", event: "Payment received — $195.00", icon: "$" },
        ].map((a, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">{a.icon}</div>
            <div className="flex-1">
              <p className="text-sm text-foreground">{a.event}</p>
              <p className="text-xs text-muted-foreground">{a.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TenantDashboard({ user, onNav }: { user: any; onNav: (id: string) => void }) {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-foreground mb-1">Welcome back, {user.firstName}</h1>
      <p className="text-sm text-muted-foreground mb-6">{user.unit}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Monthly Premium", value: "$33", sub: "$396/yr", accent: true },
          { label: "Contents Covered", value: "$40K", sub: "Replacement cost" },
          { label: "Liability", value: "$2M", sub: "Personal liability" },
          { label: "Renewal", value: "180d", sub: "Sep 1, 2026" },
        ].map((k, i) => (
          <div key={i} className="bg-card border-2 border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
            <p className={`text-2xl font-extrabold ${k.accent ? "text-accent" : "text-foreground"}`}>{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Send to Landlord", icon: "📄", nav: "documents" },
          { label: "File a Claim", icon: "🛡️", nav: "claims" },
          { label: "Update Inventory", icon: "📦", nav: "inventory" },
          { label: "Adjust Coverage", icon: "⚙️", nav: "policy" },
        ].map((qa, i) => (
          <button key={i} onClick={() => onNav(qa.nav)}
            className="bg-card border-2 border-border rounded-2xl p-5 text-center hover:border-accent/40 hover:shadow-sm transition-all">
            <div className="text-2xl mb-2">{qa.icon}</div>
            <p className="font-bold text-foreground text-sm">{qa.label}</p>
          </button>
        ))}
      </div>

      <div className="bg-card border-2 border-border rounded-2xl p-6">
        <h3 className="font-bold text-foreground mb-4">Recent Activity</h3>
        {[
          { date: "Mar 2", event: "Payment received — $33.00", icon: "$" },
          { date: "Feb 15", event: "Certificate sent to Greenfield Property Management", icon: "📄" },
          { date: "Feb 10", event: "Added 3 items to inventory ($1,550 total)", icon: "📦" },
          { date: "Feb 1", event: "Payment received — $33.00", icon: "$" },
        ].map((a, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">{a.icon}</div>
            <div className="flex-1">
              <p className="text-sm text-foreground">{a.event}</p>
              <p className="text-xs text-muted-foreground">{a.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PartnerDashboard({ user, onNav }: { user: any; onNav: (id: string) => void }) {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">{user.company}</h1>
          <p className="text-sm text-muted-foreground">{user.partnerType} · Partner since {user.accountSince}</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors">
          Generate Referral Link
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Policies", value: user.activePolicies, sub: "11 this month" },
          { label: "Total GWP", value: `$${(user.totalGWP / 1000).toFixed(0)}K`, sub: "147 total referrals" },
          { label: "Total Commission", value: "$28,458", sub: "$2,860 this month", accent: true },
          { label: "Conversion Rate", value: "80.3%", sub: "$3,240 pending" },
        ].map((k, i) => (
          <div key={i} className="bg-card border-2 border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
            <p className={`text-2xl font-extrabold ${k.accent ? "text-accent" : "text-foreground"}`}>{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "New Client Quote", icon: "📋", href: "/quote" },
          { label: "View Commissions", icon: "💰", nav: "commissions" },
          { label: "Marketing Materials", icon: "📣", nav: "marketing" },
          { label: "API Docs", icon: "⚡", nav: "integration" },
        ].map((qa, i) => (
          <button key={i} onClick={() => qa.href ? window.location.href = qa.href : onNav(qa.nav!)}
            className="bg-card border-2 border-border rounded-2xl p-5 text-center hover:border-accent/40 hover:shadow-sm transition-all">
            <div className="text-2xl mb-2">{qa.icon}</div>
            <p className="font-bold text-foreground text-sm">{qa.label}</p>
          </button>
        ))}
      </div>

      <div className="bg-card border-2 border-border rounded-2xl p-6">
        <h3 className="font-bold text-foreground mb-4">Recent Activity</h3>
        {[
          { date: "Mar 2", event: "Policy bound — 456 Dundas St E — $1,890/yr", amount: "+$340" },
          { date: "Mar 1", event: "Quote generated — 22 Elm St, Toronto", amount: null },
          { date: "Feb 28", event: "Renewal processed — 789 King St — $1,155/yr", amount: "+$208" },
          { date: "Feb 25", event: "February commission payout deposited", amount: "+$4,120" },
        ].map((a, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                {a.amount ? "✓" : "→"}
              </div>
              <div>
                <p className="text-sm text-foreground">{a.event}</p>
                <p className="text-xs text-muted-foreground">{a.date}</p>
              </div>
            </div>
            {a.amount && <span className="text-sm font-bold text-accent">{a.amount}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// CONTENT RENDERER
// ═══════════════════════════════════════════════════

function PortalContent({ type, activeNav, onNav }: { type: PortalType; activeNav: string; onNav: (id: string) => void }) {
  const user = MOCK_USERS[type];

  if (type === "landlord") {
    switch (activeNav) {
      case "dashboard": return <LandlordDashboard user={user} onNav={onNav} />;
      case "policies": return <PlaceholderSection title="My Policies" description="View and manage all your rental property insurance policies in one place." />;
      case "portfolio": return <PortfolioView />;
      case "maintenance": return <MaintenanceLog />;
      case "claims": return <PlaceholderSection title="Claims" description="File new claims and track the status of existing ones." />;
      case "documents": return <PlaceholderSection title="Documents" description="Access your policy documents, certificates, and receipts." />;
      case "billing": return <PlaceholderSection title="Billing" description="View payment history, update payment methods, and manage billing preferences." />;
      case "referrals": return <ReferralProgram />;
      case "settings": return <PlaceholderSection title="Settings" description="Update your profile, notification preferences, and account settings." />;
      default: return null;
    }
  }

  if (type === "tenant") {
    switch (activeNav) {
      case "dashboard": return <TenantDashboard user={user} onNav={onNav} />;
      case "policy": return <PlaceholderSection title="My Policy" description="View your tenant insurance policy details, coverage limits, and deductibles." />;
      case "inventory": return <PlaceholderSection title="Contents Inventory" description="Track your personal belongings for accurate coverage and faster claims." />;
      case "claims": return <PlaceholderSection title="Claims" description="File new claims and track the status of existing ones." />;
      case "documents": return <PlaceholderSection title="Documents" description="Access and share your certificate of insurance and policy documents." />;
      case "billing": return <PlaceholderSection title="Billing" description="View payment history and manage your payment method." />;
      case "referrals": return <ReferralProgram />;
      case "settings": return <PlaceholderSection title="Settings" description="Update your profile, notification preferences, and account settings." />;
      default: return null;
    }
  }

  if (type === "partner") {
    switch (activeNav) {
      case "dashboard": return <PartnerDashboard user={user} onNav={onNav} />;
      case "referrals": return <PlaceholderSection title="Referrals" description="Track all your client referrals, their status, and conversion metrics." />;
      case "commissions": return <PlaceholderSection title="Commissions" description="View your earned commissions, pending payouts, and payment history." />;
      case "properties": return <PlaceholderSection title="Properties" description="Manage properties in your portfolio and their insurance status." />;
      case "marketing": return <PlaceholderSection title="Marketing" description="Access branded materials, widgets, and co-marketing resources." />;
      case "integration": return <PlaceholderSection title="Integration" description="Set up API access, webhooks, and embed widgets for your platform." />;
      case "settings": return <PlaceholderSection title="Settings" description="Update your company profile, team members, and account settings." />;
      default: return null;
    }
  }

  return null;
}

// ═══════════════════════════════════════════════════
// MAIN PORTAL
// ═══════════════════════════════════════════════════

export default function Portal() {
  const [portalType, setPortalType] = useState<PortalType | null>(null);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showRenewal, setShowRenewal] = useState(false);

  const { user: authUser, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    await signOut();
    navigate("/");
  }, [signOut, navigate]);

  const handleSelectType = (type: PortalType) => {
    setPortalType(type);
    setActiveNav("dashboard");
  };

  const handleBackToSelector = () => {
    setPortalType(null);
    setActiveNav("dashboard");
  };

  // Show portal type selector first
  if (!portalType) {
    return <PortalTypeSelector onSelect={handleSelectType} />;
  }

  const mockUser = MOCK_USERS[portalType];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <PortalSidebar
        type={portalType}
        activeNav={activeNav}
        onNav={setActiveNav}
        user={mockUser}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-background sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={handleBackToSelector} className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Switch Portal
            </button>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button onClick={() => window.location.href = "/support"} className="p-2 rounded-lg hover:bg-muted/50 transition-colors" title="Help">
              <HelpCircle size={20} className="text-muted-foreground" />
            </button>
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
              <span className="text-xs font-bold text-accent">{mockUser.firstName[0]}{mockUser.lastName[0]}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <PortalContent type={portalType} activeNav={activeNav} onNav={setActiveNav} />
        </main>
      </div>

      {showRenewal && <RenewalManagement onClose={() => setShowRenewal(false)} />}
    </div>
  );
}
