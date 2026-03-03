import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ═══ MOCK DATA ═══

const MOCK_POLICIES = [
  { id: "CED-2025-001247", address: "123 Queen St W, Toronto, ON", type: "Standard", status: "Active", units: 2, premium: 1890 },
  { id: "CED-2025-003891", address: "456 Dundas St E, Toronto, ON", type: "Premium", status: "Active", units: 4, premium: 4250 },
  { id: "CED-2025-005102", address: "789 King St, Hamilton, ON", type: "Basic", status: "Active", units: 1, premium: 1120 },
];

const MOCK_CLAIMS = [
  {
    id: "CLM-2025-00421", policyId: "CED-2025-001247", address: "123 Queen St W, Toronto, ON",
    type: "Water Damage", status: "In Review", filed: "2025-11-14", amount: 8500,
    description: "Burst pipe in Unit 2 kitchen causing water damage to flooring and lower cabinets.",
    timeline: [
      { date: "2025-11-14", event: "Claim filed", detail: "FNOL submitted via Cedar portal", done: true },
      { date: "2025-11-15", event: "Claim acknowledged", detail: "Claim number assigned, adjuster notified", done: true },
      { date: "2025-11-18", event: "Adjuster assigned", detail: "Sarah Mitchell, Crawford & Company", done: true },
      { date: "2025-11-22", event: "Inspection scheduled", detail: "Nov 25, 2025 at 10:00 AM", done: false },
      { date: "", event: "Assessment complete", detail: "Pending inspection", done: false },
      { date: "", event: "Settlement", detail: "Pending assessment", done: false },
    ],
  },
  {
    id: "CLM-2025-00387", policyId: "CED-2025-003891", address: "456 Dundas St E, Toronto, ON",
    type: "Liability", status: "Settled", filed: "2025-09-03", amount: 3200,
    description: "Tenant slip and fall on icy walkway. Minor injury, medical expenses claimed.",
    timeline: [
      { date: "2025-09-03", event: "Claim filed", detail: "FNOL submitted via Cedar portal", done: true },
      { date: "2025-09-04", event: "Claim acknowledged", detail: "Claim number assigned", done: true },
      { date: "2025-09-06", event: "Adjuster assigned", detail: "Mark Chen, ClaimsPro", done: true },
      { date: "2025-09-12", event: "Investigation complete", detail: "Liability confirmed, coverage applies", done: true },
      { date: "2025-09-20", event: "Settlement approved", detail: "$3,200 approved for medical expenses", done: true },
      { date: "2025-09-25", event: "Payment issued", detail: "$3,200 paid to claimant", done: true },
    ],
  },
];

const LOSS_TYPES = [
  { value: "water", label: "Water Damage", desc: "Burst pipes, flooding, sewer backup, water heater leak", icon: "💧" },
  { value: "fire", label: "Fire / Smoke", desc: "Fire damage, smoke damage, electrical fire", icon: "🔥" },
  { value: "weather", label: "Weather / Storm", desc: "Wind, hail, ice, fallen tree, lightning", icon: "⛈️" },
  { value: "theft", label: "Theft / Vandalism", desc: "Break-in, stolen property, intentional damage", icon: "🔒" },
  { value: "liability", label: "Liability / Injury", desc: "Tenant or visitor injury on property", icon: "⚠️" },
  { value: "other", label: "Other", desc: "Anything not listed above", icon: "📋" },
];

const AFFECTED_AREAS = [
  "Kitchen", "Bathroom", "Bedroom", "Living Room", "Basement",
  "Roof / Attic", "Exterior / Siding", "Garage", "Common Areas", "Hallway / Stairs",
];

// ═══ REUSABLE COMPONENTS ═══

function ClaimSelectionCard({ selected, onClick, label, description, icon, extra }: {
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
            {selected && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "In Review": "bg-amber-100 text-amber-800",
    "Settled": "bg-green-100 text-green-800",
    "Under Investigation": "bg-blue-100 text-blue-800",
    "Pending Documents": "bg-orange-100 text-orange-800",
    "Denied": "bg-red-100 text-red-800",
    "Submitted": "bg-accent/10 text-accent",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

// ═══ CLAIMS LANDING ═══

function ClaimsLanding({ onFile, onView }: { onFile: () => void; onView: () => void }) {
  return (
    <div className="text-center py-16 px-5 max-w-3xl mx-auto">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      </div>
      <h1 className="text-4xl font-extrabold text-foreground mb-3">Claims Centre</h1>
      <p className="text-lg text-muted-foreground mb-12">
        Need to report damage or check on an existing claim? We're here to help.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div onClick={onFile}
          className="bg-card rounded-2xl border-2 border-border p-8 cursor-pointer hover:border-accent/50 hover:shadow-lg transition-all group text-left">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">File a Claim</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Report a new incident and start the claims process. We'll guide you through each step.
          </p>
          <div className="flex items-center gap-2 text-accent font-semibold text-sm group-hover:gap-3 transition-all">
            Start a new claim
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>

        <div onClick={onView}
          className="bg-card rounded-2xl border-2 border-border p-8 cursor-pointer hover:border-accent/50 hover:shadow-lg transition-all group text-left">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">View a Claim</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Check the status of an existing claim, view your timeline, or upload additional documents.
          </p>
          <div className="flex items-center gap-2 text-accent font-semibold text-sm group-hover:gap-3 transition-all">
            Look up a claim
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
      </div>

      {/* Emergency banner */}
      <div className="mt-10 bg-red-50 border border-red-200 rounded-xl p-5 text-left flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2" strokeLinecap="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-red-800 mb-1">Emergency?</p>
          <p className="text-sm text-red-700">
            If there is an active fire, gas leak, or safety threat, call 911 first. Then call our 24/7 emergency claims line at{" "}
            <span className="font-bold">1-888-555-CEDAR</span> for immediate assistance with emergency repairs and temporary housing.
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══ FILE A CLAIM FLOW ═══

function FileClaimFlow({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [selectedPolicy, setSelectedPolicy] = useState("");
  const [lossType, setLossType] = useState("");
  const [incident, setIncident] = useState<any>({
    date: "", time: "", description: "", emergencyServices: false,
    propertySecured: true, tenantsDisplaced: false,
  });
  const [damage, setDamage] = useState<any>({ areas: [] as string[], severity: "", estimatedCost: "" });
  const [docs, setDocs] = useState<any>({ photos: [] as string[], policeReport: false, policeReportNumber: "", additionalNotes: "" });
  const [submitted, setSubmitted] = useState(false);

  const STEPS = ["Policy", "Incident", "Damage", "Documents", "Review"];

  const nextStep = useCallback(() => {
    if (step === 4) { setSubmitted(true); return; }
    setStep((s) => Math.min(s + 1, 4));
  }, [step]);

  const prevStep = useCallback(() => {
    if (step === 0) onBack();
    else setStep((s) => s - 1);
  }, [step, onBack]);

  const policy = MOCK_POLICIES.find((p) => p.id === selectedPolicy);

  const canProceed =
    step === 0 ? !!selectedPolicy && !!lossType :
    step === 1 ? !!incident.date && !!incident.description :
    step === 2 ? damage.areas.length > 0 && !!damage.severity :
    true;

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-16 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-foreground mb-3">Claim Submitted</h2>
        <p className="text-muted-foreground mb-2">Your claim has been received and is being processed.</p>
        <div className="bg-card border-2 border-border rounded-xl p-6 my-8 inline-block text-left">
          <p className="text-sm text-muted-foreground mb-1">Claim Reference Number</p>
          <p className="text-2xl font-bold text-accent tracking-wide">CLM-2026-00{Math.floor(Math.random() * 900 + 100)}</p>
          <div className="border-t border-border mt-4 pt-4 space-y-2">
            <p className="text-sm"><span className="text-muted-foreground">Policy:</span> <span className="font-medium">{selectedPolicy}</span></p>
            <p className="text-sm"><span className="text-muted-foreground">Type:</span> <span className="font-medium">{LOSS_TYPES.find((l) => l.value === lossType)?.label}</span></p>
            <p className="text-sm"><span className="text-muted-foreground">Date of Loss:</span> <span className="font-medium">{incident.date}</span></p>
          </div>
        </div>
        <div className="bg-accent/10 rounded-xl p-5 text-left max-w-md mx-auto mb-8">
          <p className="font-semibold text-accent mb-2">What happens next?</p>
          <div className="space-y-3">
            {[
              "You'll receive a confirmation email within the hour",
              "An adjuster will be assigned within 1-2 business days",
              "The adjuster will contact you to schedule an inspection",
              "You can track progress anytime from the Claims Centre",
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
          Back to Claims Centre
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <StepProgress steps={STEPS} current={step} />

      {/* STEP 1: SELECT POLICY + LOSS TYPE */}
      {step === 0 && (
        <div>
          <h2 className="text-2xl font-extrabold text-foreground mb-1">Select your policy</h2>
          <p className="text-muted-foreground mb-6">Which property is this claim for?</p>
          <div className="flex flex-col gap-3 mb-8">
            {MOCK_POLICIES.map((p) => (
              <ClaimSelectionCard key={p.id} selected={selectedPolicy === p.id}
                onClick={() => setSelectedPolicy(p.id)}
                label={p.address}
                description={`Policy ${p.id} · ${p.type} Plan · ${p.units} unit${p.units > 1 ? "s" : ""}`}
                extra={p.status}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                } />
            ))}
          </div>
          <h2 className="text-2xl font-extrabold text-foreground mb-1">What happened?</h2>
          <p className="text-muted-foreground mb-6">Select the type of loss or incident.</p>
          <div className="grid grid-cols-2 gap-3">
            {LOSS_TYPES.map((lt) => (
              <ClaimSelectionCard key={lt.value} selected={lossType === lt.value}
                onClick={() => setLossType(lt.value)}
                label={lt.label} description={lt.desc} icon={lt.icon} />
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: INCIDENT DETAILS */}
      {step === 1 && (
        <div>
          <h2 className="text-2xl font-extrabold text-foreground mb-1">Incident details</h2>
          <p className="text-muted-foreground mb-6">Tell us when and how the incident occurred.</p>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Date of Incident *</label>
              <input type="date" value={incident.date}
                onChange={(e) => setIncident((p: any) => ({ ...p, date: e.target.value }))}
                className="w-full p-3 rounded-lg border-2 border-border bg-card text-foreground outline-none focus:border-accent transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Approximate Time</label>
              <input type="time" value={incident.time}
                onChange={(e) => setIncident((p: any) => ({ ...p, time: e.target.value }))}
                className="w-full p-3 rounded-lg border-2 border-border bg-card text-foreground outline-none focus:border-accent transition-colors" />
            </div>
          </div>
          <div className="mb-5">
            <label className="block text-sm font-semibold text-foreground mb-1">Describe what happened *</label>
            <textarea value={incident.description}
              onChange={(e) => setIncident((p: any) => ({ ...p, description: e.target.value }))}
              placeholder="Please provide as much detail as possible — what happened, how you discovered the damage, any immediate actions taken..."
              rows={5}
              className="w-full p-3 rounded-lg border-2 border-border bg-card text-foreground outline-none focus:border-accent transition-colors resize-none" />
            <p className="text-xs text-muted-foreground mt-1">The more detail you provide, the faster we can process your claim.</p>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground mb-2">Additional information</label>
            <ClaimSelectionCard selected={incident.emergencyServices}
              onClick={() => setIncident((p: any) => ({ ...p, emergencyServices: !p.emergencyServices }))}
              label="Emergency services were called"
              description="Fire department, police, paramedics, or utilities" />
            <ClaimSelectionCard selected={incident.tenantsDisplaced}
              onClick={() => setIncident((p: any) => ({ ...p, tenantsDisplaced: !p.tenantsDisplaced }))}
              label="Tenants have been displaced"
              description="Tenants cannot currently live in the property" />
            <ClaimSelectionCard selected={!incident.propertySecured}
              onClick={() => setIncident((p: any) => ({ ...p, propertySecured: !p.propertySecured }))}
              label="Property is not currently secured"
              description="Doors, windows, or structure compromised" />
          </div>
        </div>
      )}

      {/* STEP 3: DAMAGE DETAILS */}
      {step === 2 && (
        <div>
          <h2 className="text-2xl font-extrabold text-foreground mb-1">Damage details</h2>
          <p className="text-muted-foreground mb-6">Help us understand the extent of the damage.</p>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-2">Affected areas (select all that apply) *</label>
            <div className="grid grid-cols-2 gap-2">
              {AFFECTED_AREAS.map((area) => (
                <ClaimSelectionCard key={area}
                  selected={damage.areas.includes(area)}
                  onClick={() => setDamage((d: any) => ({
                    ...d,
                    areas: d.areas.includes(area) ? d.areas.filter((a: string) => a !== area) : [...d.areas, area],
                  }))}
                  label={area} />
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-2">Severity of damage *</label>
            <div className="flex flex-col gap-3">
              <ClaimSelectionCard selected={damage.severity === "minor"} onClick={() => setDamage((d: any) => ({ ...d, severity: "minor" }))}
                label="Minor" description="Cosmetic damage, small area affected, property still habitable" />
              <ClaimSelectionCard selected={damage.severity === "moderate"} onClick={() => setDamage((d: any) => ({ ...d, severity: "moderate" }))}
                label="Moderate" description="Significant damage to one or more rooms, repairs needed but structure intact" />
              <ClaimSelectionCard selected={damage.severity === "severe"} onClick={() => setDamage((d: any) => ({ ...d, severity: "severe" }))}
                label="Severe" description="Major structural damage, property may be uninhabitable, extensive repairs required" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Estimated repair cost (if known)</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</div>
              <input type="number" value={damage.estimatedCost}
                onChange={(e) => setDamage((d: any) => ({ ...d, estimatedCost: e.target.value }))}
                placeholder="Optional — enter if you've received a quote"
                className="w-full pl-8 pr-4 py-3 rounded-lg border-2 border-border bg-card text-foreground outline-none focus:border-accent transition-colors" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Don't worry if you're unsure — our adjuster will assess the damage.</p>
          </div>
        </div>
      )}

      {/* STEP 4: DOCUMENTS */}
      {step === 3 && (
        <div>
          <h2 className="text-2xl font-extrabold text-foreground mb-1">Supporting documents</h2>
          <p className="text-muted-foreground mb-6">Upload photos and any supporting documentation. You can also add more later.</p>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-2">Photos of damage</label>
            <div
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent/40 hover:bg-accent/5 transition-all"
              onClick={() => {
                const mockPhotos = ["kitchen_damage_1.jpg", "kitchen_damage_2.jpg", "floor_closeup.jpg"];
                setDocs((d: any) => ({ ...d, photos: mockPhotos }));
              }}>
              {docs.photos.length === 0 ? (
                <>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="mx-auto mb-3 text-muted-foreground">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <p className="text-sm font-medium text-foreground">Click to upload photos</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 10MB each</p>
                </>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-accent mb-2">✓ {docs.photos.length} photos uploaded</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {docs.photos.map((p: string, i: number) => (
                      <span key={i} className="bg-accent/10 text-accent text-xs px-3 py-1 rounded-full">{p}</span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Click to add more</p>
                </div>
              )}
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-2">Police or fire report?</label>
            <div className="flex gap-3 mb-3">
              <ClaimSelectionCard selected={docs.policeReport === true}
                onClick={() => setDocs((d: any) => ({ ...d, policeReport: true }))} label="Yes" />
              <ClaimSelectionCard selected={docs.policeReport === false}
                onClick={() => setDocs((d: any) => ({ ...d, policeReport: false }))} label="No" />
            </div>
            {docs.policeReport && (
              <div className="mt-3">
                <label className="block text-sm font-semibold text-foreground mb-1">Report number</label>
                <input type="text" value={docs.policeReportNumber}
                  onChange={(e) => setDocs((d: any) => ({ ...d, policeReportNumber: e.target.value }))}
                  placeholder="e.g. TPS-2025-123456"
                  className="w-full p-3 rounded-lg border-2 border-border bg-card text-foreground outline-none focus:border-accent transition-colors" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Additional notes</label>
            <textarea value={docs.additionalNotes}
              onChange={(e) => setDocs((d: any) => ({ ...d, additionalNotes: e.target.value }))}
              placeholder="Anything else you'd like us to know..."
              rows={3}
              className="w-full p-3 rounded-lg border-2 border-border bg-card text-foreground outline-none focus:border-accent transition-colors resize-none" />
          </div>
          <div className="bg-accent/10 rounded-xl p-4 mt-6 flex items-start gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5 text-accent">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="text-xs text-accent">
              Don't have all documents ready? No problem — you can upload additional documentation after filing your claim through the Claims Centre.
            </p>
          </div>
        </div>
      )}

      {/* STEP 5: REVIEW */}
      {step === 4 && (
        <div>
          <h2 className="text-2xl font-extrabold text-foreground mb-1">Review your claim</h2>
          <p className="text-muted-foreground mb-6">Please confirm all details before submitting.</p>
          <div className="space-y-4">
            <div className="bg-card border-2 border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground">Policy & Incident</h3>
                <button onClick={() => setStep(0)} className="text-xs text-accent font-semibold hover:underline">Edit</button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Policy:</span> <span className="font-medium">{selectedPolicy}</span></div>
                <div><span className="text-muted-foreground">Property:</span> <span className="font-medium">{policy?.address}</span></div>
                <div><span className="text-muted-foreground">Loss Type:</span> <span className="font-medium">{LOSS_TYPES.find((l) => l.value === lossType)?.label}</span></div>
                <div><span className="text-muted-foreground">Plan:</span> <span className="font-medium">{policy?.type}</span></div>
              </div>
            </div>
            <div className="bg-card border-2 border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground">Incident Details</h3>
                <button onClick={() => setStep(1)} className="text-xs text-accent font-semibold hover:underline">Edit</button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{incident.date}</span></div>
                <div><span className="text-muted-foreground">Time:</span> <span className="font-medium">{incident.time || "Not specified"}</span></div>
              </div>
              <p className="text-sm text-foreground">{incident.description}</p>
              {incident.emergencyServices && <p className="text-xs text-amber-700 mt-2">⚠ Emergency services were called</p>}
              {incident.tenantsDisplaced && <p className="text-xs text-amber-700">⚠ Tenants displaced</p>}
            </div>
            <div className="bg-card border-2 border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground">Damage</h3>
                <button onClick={() => setStep(2)} className="text-xs text-accent font-semibold hover:underline">Edit</button>
              </div>
              <div className="text-sm space-y-2">
                <div><span className="text-muted-foreground">Areas:</span> <span className="font-medium">{damage.areas.join(", ")}</span></div>
                <div><span className="text-muted-foreground">Severity:</span> <span className="font-medium capitalize">{damage.severity}</span></div>
                {damage.estimatedCost && <div><span className="text-muted-foreground">Est. Cost:</span> <span className="font-medium">${parseInt(damage.estimatedCost).toLocaleString()}</span></div>}
              </div>
            </div>
            <div className="bg-card border-2 border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground">Documents</h3>
                <button onClick={() => setStep(3)} className="text-xs text-accent font-semibold hover:underline">Edit</button>
              </div>
              <div className="text-sm space-y-2">
                <div><span className="text-muted-foreground">Photos:</span> <span className="font-medium">{docs.photos.length} uploaded</span></div>
                <div><span className="text-muted-foreground">Police/Fire Report:</span> <span className="font-medium">{docs.policeReport ? `Yes — ${docs.policeReportNumber || "No number provided"}` : "No"}</span></div>
              </div>
            </div>
          </div>
          <div className="bg-muted/30 rounded-xl p-4 mt-6 text-xs text-muted-foreground">
            By submitting this claim, I confirm that the information provided is accurate and complete to the best of my knowledge. I understand that providing false or misleading information may result in denial of the claim and/or policy cancellation.
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center mt-10 pt-5 border-t border-border">
        <button onClick={prevStep}
          className="px-6 py-3 rounded-xl font-semibold border-2 border-border text-foreground hover:border-accent/40 transition-colors flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          {step === 0 ? "Claims Centre" : "Back"}
        </button>
        <button onClick={nextStep} disabled={!canProceed}
          className="bg-accent text-white px-6 py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          {step === 4 ? "Submit Claim" : "Continue"}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ═══ VIEW CLAIMS ═══

function ViewClaimsFlow({ onBack }: { onBack: () => void }) {
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [lookupValue, setLookupValue] = useState("");

  const claim = MOCK_CLAIMS.find((c) => c.id === selectedClaim);

  if (claim) {
    const lastDoneIndex = claim.timeline.reduce((acc, t, i) => (t.done ? i : acc), -1);
    return (
      <div className="max-w-2xl mx-auto px-5 py-10">
        <button onClick={() => setSelectedClaim(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back to all claims
        </button>

        {/* Claim header */}
        <div className="bg-card border-2 border-border rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Claim</p>
              <h2 className="text-2xl font-extrabold text-foreground">{claim.id}</h2>
            </div>
            <StatusBadge status={claim.status} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Property</p>
              <p className="font-medium text-foreground">{claim.address}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Policy</p>
              <p className="font-medium text-foreground">{claim.policyId}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Loss Type</p>
              <p className="font-medium text-foreground">{claim.type}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Filed</p>
              <p className="font-medium text-foreground">{claim.filed}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="font-medium text-foreground">${claim.amount.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-1">Description</p>
            <p className="text-sm text-foreground">{claim.description}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-card border-2 border-border rounded-2xl p-6">
          <h3 className="font-bold text-foreground mb-5">Claim Timeline</h3>
          <div className="space-y-0">
            {claim.timeline.map((t, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${
                    t.done ? "bg-accent" : i === lastDoneIndex + 1 ? "bg-accent/40 ring-4 ring-accent/10" : "bg-muted"
                  }`} />
                  {i < claim.timeline.length - 1 && (
                    <div className={`w-0.5 flex-1 my-1 ${t.done ? "bg-accent" : "bg-muted"}`} />
                  )}
                </div>
                <div className="pb-6">
                  <p className={`font-semibold text-sm ${t.done ? "text-foreground" : "text-muted-foreground"}`}>{t.event}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.detail}</p>
                  {t.date && <p className="text-xs text-muted-foreground/60 mt-0.5">{t.date}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button className="flex-1 px-5 py-3 rounded-xl font-semibold border-2 border-border text-foreground hover:border-accent/40 transition-colors text-sm">
            Upload Documents
          </button>
          <button className="flex-1 px-5 py-3 rounded-xl font-semibold border-2 border-border text-foreground hover:border-accent/40 transition-colors text-sm">
            Contact Adjuster
          </button>
        </div>
      </div>
    );
  }

  // Claims list
  const filteredClaims = lookupValue
    ? MOCK_CLAIMS.filter((c) =>
        c.id.toLowerCase().includes(lookupValue.toLowerCase()) ||
        c.address.toLowerCase().includes(lookupValue.toLowerCase())
      )
    : MOCK_CLAIMS;

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <button onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-6">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
        </svg>
        Back to Claims Centre
      </button>

      <h2 className="text-2xl font-extrabold text-foreground mb-1">Your Claims</h2>
      <p className="text-muted-foreground mb-6">View and track all your insurance claims.</p>

      <div className="mb-6">
        <input type="text" value={lookupValue}
          onChange={(e) => setLookupValue(e.target.value)}
          placeholder="Search by claim number or address..."
          className="w-full p-3 rounded-lg border-2 border-border bg-card text-foreground outline-none focus:border-accent transition-colors" />
      </div>

      <div className="space-y-3">
        {filteredClaims.map((c) => (
          <div key={c.id} onClick={() => setSelectedClaim(c.id)}
            className="bg-card border-2 border-border rounded-xl p-5 cursor-pointer hover:border-accent/50 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-bold text-foreground">{c.id}</p>
                <p className="text-sm text-muted-foreground">{c.address}</p>
              </div>
              <StatusBadge status={c.status} />
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
              <span>{c.type}</span>
              <span>·</span>
              <span>Filed {c.filed}</span>
              <span>·</span>
              <span>${c.amount.toLocaleString()}</span>
            </div>
          </div>
        ))}
        {filteredClaims.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <p className="font-medium">No claims found</p>
            <p className="text-sm mt-1">Try a different search term or claim number.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══ MAIN CLAIMS PAGE ═══

type ClaimsView = "landing" | "file" | "view";

const Claims = () => {
  const [view, setView] = useState<ClaimsView>("landing");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        {view === "landing" && (
          <ClaimsLanding onFile={() => setView("file")} onView={() => setView("view")} />
        )}
        {view === "file" && (
          <FileClaimFlow onBack={() => setView("landing")} />
        )}
        {view === "view" && (
          <ViewClaimsFlow onBack={() => setView("landing")} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Claims;
