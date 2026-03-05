import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ═══ HELP CATEGORIES ═══
const HELP_TOPICS = [
  {
    id: "policy",
    label: "My Policy",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    articles: [
      { q: "How do I view or download my policy documents?", a: "Log in to your Cedar account and navigate to 'My Policies'. Select the property and click 'View Documents'. You can download your full policy, declarations page, and any endorsements as PDFs." },
      { q: "How do I get a certificate of insurance?", a: "Certificates are available instantly from your dashboard. Go to 'My Policies' → select the property → click 'Generate Certificate'. You can email it directly to your landlord, lender, or property manager from the platform." },
      { q: "How do I make changes to my policy (endorsements)?", a: "You can request most changes online — adding a unit, updating coverage limits, changing your mailing address, or adding additional insured parties. Go to 'My Policies' → 'Request Change'. Most endorsements are processed within 1-2 business days." },
      { q: "How do I cancel my policy?", a: "Contact us by phone or email to initiate a cancellation. We'll confirm any return premium owed and process the cancellation. Please note that your lender or landlord may require proof of replacement coverage before we can cancel." },
      { q: "When does my policy renew?", a: "Policies renew annually. You'll receive a renewal notice 60 days before your expiry date with updated terms and pricing. If no changes are needed, your policy auto-renews — no action required." },
    ],
  },
  {
    id: "billing",
    label: "Billing & Payments",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    articles: [
      { q: "What payment methods do you accept?", a: "We accept Visa, Mastercard, and American Express for online payments. For annual policies, we also accept bank transfers (EFT) and pre-authorized debit (PAD). Monthly payment plans are available at no additional cost on all policies." },
      { q: "How do I update my payment method?", a: "Log in and go to 'Billing' → 'Payment Methods'. You can add a new card, switch to a different payment method, or set up pre-authorized debit. Changes take effect on your next billing cycle." },
      { q: "Can I pay monthly instead of annually?", a: "Yes. All Cedar policies can be paid monthly at no extra charge — no interest, no installment fees. You can switch between annual and monthly billing at any time from your billing settings." },
      { q: "I missed a payment — what happens?", a: "We'll attempt to process the payment again after 3 days. If it fails a second time, we'll notify you by email with a 15-day grace period to update your payment method. Your coverage remains active during the grace period. After 15 days, your policy may be suspended." },
      { q: "How do I get a receipt or invoice?", a: "All receipts and invoices are available in your account under 'Billing' → 'Transaction History'. You can download individual receipts or a full annual statement for tax purposes." },
    ],
  },
  {
    id: "claims",
    label: "Claims",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    articles: [
      { q: "How do I file a claim?", a: "You can file a claim online through our Claims Centre — available 24/7. You'll need your policy number, a description of what happened, the date of the incident, and any supporting photos. For emergencies, call our 24/7 claims line at 1-888-555-CEDAR." },
      { q: "What happens after I file a claim?", a: "You'll receive a claim confirmation with a reference number within the hour. An adjuster will be assigned within 1-2 business days and will contact you to schedule an inspection if needed. You can track your claim status in real time from the Claims Centre." },
      { q: "How long does a claim take to settle?", a: "It depends on the complexity. Simple claims (minor water damage, theft with clear documentation) are typically settled within 2-4 weeks. More complex claims involving structural damage or liability investigations can take 4-8 weeks. Your adjuster will keep you updated throughout." },
      { q: "Do I need to get repair quotes before filing?", a: "No — file your claim first. Your assigned adjuster will assess the damage and may request quotes as part of the process, but you don't need them upfront. Don't delay filing while waiting for contractor estimates." },
      { q: "Will filing a claim increase my premium?", a: "Not necessarily. A single claim typically has minimal impact on renewal pricing. Multiple claims within a short period may affect your premium at renewal. We're transparent about any pricing changes — you'll see them in your 60-day renewal notice." },
    ],
  },
  {
    id: "coverage",
    label: "Coverage Questions",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    articles: [
      { q: "What's the difference between Basic, Standard, and Premium plans?", a: "Basic covers named perils (specific listed events like fire, theft, windstorm) with $1M liability. Standard upgrades to broad form coverage with $2M liability, sewer backup, and equipment breakdown. Premium provides all-risk coverage with $5M liability, guaranteed replacement cost, and identity theft protection. All plans include loss of rental income." },
      { q: "Does my policy cover flooding?", a: "Sewer backup and water damage from internal sources (burst pipes, appliance leaks) are covered on Standard and Premium plans. Overland flood coverage (rising water from rivers, lakes, or extreme rainfall) may be available as an add-on depending on your property's flood zone. We'll flag this during your quote." },
      { q: "Am I covered if my property is vacant?", a: "Vacancy affects your coverage. Most policies require notification if a property will be vacant for more than 30 consecutive days. We offer a vacancy endorsement that maintains coverage during extended vacancy periods — flag it during your quote or contact us to add it to an existing policy." },
      { q: "Does this cover short-term rentals (Airbnb)?", a: "Yes, with a short-term rental endorsement. Standard landlord policies exclude short-term rental activity, so it's important to disclose this during your quote. We'll price it accurately and ensure your coverage actually applies when you need it." },
      { q: "Can I add my property manager or lender as an additional insured?", a: "Yes. You can add additional insured parties (mortgage lenders, property management companies, condo corporations) to your policy at no extra cost. Request it during the quote process or through a policy endorsement after binding." },
    ],
  },
  {
    id: "account",
    label: "My Account",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
    articles: [
      { q: "How do I create an account?", a: "Your account is created automatically when you complete your first quote. You'll receive an email with a link to set your password. If you've already received a quote but didn't bind, you can still log in with the email you used during the quoting process." },
      { q: "How do I reset my password?", a: "Click 'Login' → 'Forgot Password' and enter the email associated with your account. You'll receive a reset link within a few minutes. If you don't see it, check your spam folder or contact support." },
      { q: "Can I manage multiple properties under one account?", a: "Yes. Your Cedar account supports multiple policies across multiple properties. You'll see all of your properties, policies, certificates, and billing in a single dashboard. Each property has its own policy with individual coverage and billing." },
      { q: "How do I update my contact information?", a: "Log in and go to 'Account Settings' → 'Personal Information'. You can update your email, phone number, and mailing address. Note that your mailing address change may also require a policy endorsement if it's your insured property address." },
    ],
  },
  {
    id: "partners",
    label: "Partner Support",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    articles: [
      { q: "How do I access my partner dashboard?", a: "Go to cedar.ca/partners and click 'Partner Login'. Use the credentials provided during your partner onboarding. If you haven't received login details, contact our partnerships team at partners@cedar.ca." },
      { q: "How do I generate a referral link?", a: "Log in to your partner dashboard and click 'Generate Referral Link'. You can create unique links for different campaigns or channels to track which referrals convert best. Links are active immediately." },
      { q: "When do I receive commission payments?", a: "Commissions are paid monthly, on the 15th of the following month. You'll receive a detailed commission statement by email on the 1st showing all policies bound, renewed, and cancelled during the prior period. Payments are made via EFT to your registered bank account." },
      { q: "How do I access marketing materials?", a: "Marketing materials including co-branded flyers, email templates, social media assets, and explainer videos are available in your partner dashboard under 'Resources'. All materials can be customized with your logo and contact information." },
    ],
  },
];

// ═══ SELF-SERVICE ACTIONS ═══
const QUICK_ACTIONS = [
  {
    label: "Get a Certificate",
    desc: "Download or email a certificate of insurance instantly",
    href: "/login",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    label: "File a Claim",
    desc: "Report an incident through our Claims Centre",
    href: "/claims",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    label: "Make a Payment",
    desc: "Pay your premium or update your payment method",
    href: "/login",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    label: "Request a Change",
    desc: "Update coverage, add units, or modify your policy",
    href: "/login",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
];

// ═══ CONTACT FORM ═══
function ContactForm() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", policyNumber: "",
    topic: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const canSubmit = form.name && form.email && form.topic && form.message;

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Message Sent</h3>
        <p className="text-muted-foreground mb-4">
          We've received your message and will respond within 1 business day.
        </p>
        <p className="text-sm text-accent font-medium">
          Reference: SUP-2026-{String(Math.floor(Math.random() * 90000 + 10000))}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Name *</label>
          <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)}
            placeholder="Your full name"
            className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Email *</label>
          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
            placeholder="you@email.com"
            className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent transition-colors" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Phone</label>
          <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)}
            placeholder="(416) 555-0123"
            className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Policy Number</label>
          <input type="text" value={form.policyNumber} onChange={(e) => update("policyNumber", e.target.value)}
            placeholder="CED-2025-XXXXXX (if applicable)"
            className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent transition-colors" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">Topic *</label>
        <select value={form.topic} onChange={(e) => update("topic", e.target.value)}
          className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent transition-colors appearance-none cursor-pointer">
          <option value="">What do you need help with?</option>
          <option>Policy question</option>
          <option>Billing or payment</option>
          <option>Claims inquiry</option>
          <option>Coverage question</option>
          <option>Certificate request</option>
          <option>Policy change / endorsement</option>
          <option>Cancellation</option>
          <option>Partner program</option>
          <option>Technical issue</option>
          <option>Other</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">Message *</label>
        <textarea value={form.message} onChange={(e) => update("message", e.target.value)}
          placeholder="Describe your question or issue in as much detail as possible..."
          rows={5}
          className="w-full p-3 rounded-lg border-2 border-border bg-background text-foreground outline-none focus:border-accent transition-colors resize-none" />
      </div>
      <button onClick={() => setSubmitted(true)} disabled={!canSubmit}
        className="w-full bg-accent text-white py-4 rounded-xl font-semibold hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        Send Message
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}

// ═══ KNOWLEDGE BASE SECTION ═══
function KnowledgeBase() {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [openArticle, setOpenArticle] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const topic = HELP_TOPICS.find((t) => t.id === activeTopic);

  const searchResults = searchQuery.length > 2
    ? HELP_TOPICS.flatMap((t) =>
        t.articles
          .filter((a) =>
            a.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.a.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((a) => ({ ...a, topicLabel: t.label }))
      )
    : [];

  return (
    <div>
      {/* Search */}
      <div className="relative mb-8">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setActiveTopic(null); setOpenArticle(null); }}
          placeholder="Search help articles..."
          className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-border bg-card text-foreground outline-none focus:border-accent transition-colors text-base" />
      </div>

      {/* Search results */}
      {searchQuery.length > 2 && (
        <div className="mb-8">
          {searchResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No articles found for "{searchQuery}"</p>
              <p className="text-sm text-muted-foreground mt-1">Try different keywords, or contact us below.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">{searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found</p>
              {searchResults.map((r, i) => (
                <div key={i} className="bg-card border-2 border-border rounded-xl overflow-hidden">
                  <button onClick={() => setOpenArticle(openArticle === i ? null : i)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-accent font-medium">{r.topicLabel}</span>
                      <p className="font-semibold text-foreground text-sm">{r.q}</p>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="2" strokeLinecap="round"
                      className={`flex-shrink-0 transition-transform ${openArticle === i ? "rotate-180" : ""}`}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {openArticle === i && (
                    <div className="px-5 pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{r.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Topic grid */}
      {searchQuery.length <= 2 && !activeTopic && (
        <div className="grid grid-cols-3 gap-4">
          {HELP_TOPICS.map((t) => (
            <button key={t.id} onClick={() => { setActiveTopic(t.id); setOpenArticle(null); }}
              className="bg-card border-2 border-border rounded-2xl p-5 text-left hover:border-accent/40 hover:shadow-sm transition-all group">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                {t.icon}
              </div>
              <h3 className="font-bold text-foreground mb-1">{t.label}</h3>
              <p className="text-xs text-muted-foreground">{t.articles.length} articles</p>
            </button>
          ))}
        </div>
      )}

      {/* Topic detail */}
      {activeTopic && topic && searchQuery.length <= 2 && (
        <div>
          <button onClick={() => { setActiveTopic(null); setOpenArticle(null); }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-6">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            All topics
          </button>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">{topic.icon}</div>
            <h2 className="text-xl font-bold text-foreground">{topic.label}</h2>
          </div>
          <div className="space-y-2">
            {topic.articles.map((a, i) => (
              <div key={i} className="bg-card border-2 border-border rounded-xl overflow-hidden hover:border-accent/20 transition-all">
                <button onClick={() => setOpenArticle(openArticle === i ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between">
                  <span className="font-semibold text-foreground text-sm pr-4">{a.q}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" strokeWidth="2" strokeLinecap="round"
                    className={`flex-shrink-0 transition-transform ${openArticle === i ? "rotate-180" : ""}`}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {openArticle === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{a.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══ MAIN SUPPORT PAGE ═══
export default function SupportPage() {
  const [tab, setTab] = useState<"help" | "contact">("help");

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <Navbar />

      {/* Hero */}
      <section className="text-center py-12 px-5 max-w-4xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold text-foreground mb-3">How can we help?</h1>
        <p className="text-lg text-muted-foreground">
          Find answers in our help centre or get in touch directly.
        </p>
      </section>

      {/* Contact channels bar */}
      <section className="max-w-4xl mx-auto px-5 mb-10">
        <div className="bg-card border-2 border-border rounded-2xl p-6 grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <h3 className="font-bold text-foreground mb-1">Phone</h3>
            <p className="text-sm text-accent font-semibold">1-888-555-CEDAR</p>
            <p className="text-xs text-muted-foreground mt-1">Mon–Fri 9am–6pm ET</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h3 className="font-bold text-foreground mb-1">Email</h3>
            <p className="text-sm text-accent font-semibold">support@cedar.ca</p>
            <p className="text-xs text-muted-foreground mt-1">Response within 1 business day</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-foreground mb-1">Live Chat</h3>
            <p className="text-sm text-accent font-semibold">Start a conversation</p>
            <p className="text-xs text-muted-foreground mt-1">Mon–Fri 9am–8pm ET</p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="max-w-4xl mx-auto px-5 mb-10">
        <h2 className="text-lg font-bold text-foreground mb-4">Quick actions</h2>
        <div className="grid grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((qa, i) => (
            <a key={i} href={qa.href}
              className="bg-card border-2 border-border rounded-2xl p-5 text-center hover:border-accent/40 hover:shadow-sm transition-all group">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/20 transition-colors">
                {qa.icon}
              </div>
              <h3 className="font-bold text-foreground text-sm mb-1">{qa.label}</h3>
              <p className="text-xs text-muted-foreground">{qa.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Tab toggle */}
      <section className="max-w-4xl mx-auto px-5 mb-8">
        <div className="flex gap-2 bg-muted rounded-xl p-1 w-fit mx-auto">
          <button onClick={() => setTab("help")}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === "help" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}>
            Help Centre
          </button>
          <button onClick={() => setTab("contact")}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === "contact" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}>
            Contact Us
          </button>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-5 pb-16">
        {tab === "help" && <KnowledgeBase />}
        {tab === "contact" && (
          <div className="grid grid-cols-5 gap-8">
            <div className="col-span-3">
              <h2 className="text-xl font-bold text-foreground mb-2">Send us a message</h2>
              <p className="text-sm text-muted-foreground mb-6">
                We'll respond within 1 business day. For urgent claims, call our 24/7 line instead.
              </p>
              <ContactForm />
            </div>
            <div className="col-span-2 space-y-6">
              <div className="bg-card border-2 border-border rounded-2xl p-5">
                <h3 className="font-bold text-foreground mb-3">Hours of Operation</h3>
                <div className="space-y-2">
                  {[
                    { day: "Monday – Friday", hours: "9:00 AM – 6:00 PM ET" },
                    { day: "Saturday", hours: "10:00 AM – 2:00 PM ET" },
                    { day: "Sunday", hours: "Closed" },
                  ].map((h, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-foreground">{h.day}</span>
                      <span className="text-muted-foreground">{h.hours}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-accent/10 rounded-lg p-3">
                  <p className="text-xs text-accent font-medium">
                    Online quoting and self-service are available 24/7 through your account.
                  </p>
                </div>
              </div>

              {/* Emergency */}
              <div className="bg-card border-2 border-destructive/20 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--destructive))" strokeWidth="2" strokeLinecap="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Emergency Claims</h3>
                    <p className="text-sm text-destructive font-semibold">1-888-555-CEDAR</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Available 24/7 for emergency claims involving fire, flood, structural damage, or situations requiring immediate temporary housing. Call 911 first if there is an active threat.
                </p>
              </div>

              {/* Partner support */}
              <div className="bg-card border-2 border-border rounded-2xl p-5">
                <h3 className="font-bold text-foreground mb-1">Partner Support</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  For partner-specific inquiries including commissions, integrations, and marketing materials.
                </p>
                <p className="text-sm text-accent font-semibold">partners@cedar.ca</p>
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}