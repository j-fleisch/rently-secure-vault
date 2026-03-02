import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, ArrowRight, CheckCircle, Home, Shield, User, Phone,
  Building2, Calendar as CalendarIcon, Layers, Users, Tag, Plus, X,
  Mail, HelpCircle, Wrench, Clock, CalendarDays, Info, Loader2,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SelectionCard from "@/components/quote/SelectionCard";
import QuoteProgressBar from "@/components/quote/QuoteProgressBar";
import TierCard from "@/components/quote/TierCard";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { lookupProperty, type PropertyData } from "@/lib/propertyData";
import { calcPremium, COVERAGE_TIERS, type PremiumTiers } from "@/lib/premiumEngine";

// ── Owner types ──
const ownerTypes = [
  { value: "landlord", label: "Landlord", description: "I own rental property" },
  { value: "tenant", label: "Tenant", description: "I rent my home" },
  { value: "homeowner", label: "Homeowner", description: "I own and live in my home" },
];

// ── Tenant-specific data ──
const tenantInsuredOptions = [
  { value: "yes", label: "Yes", description: "I currently have tenant insurance" },
  { value: "no", label: "No", description: "I don't have coverage right now" },
  { value: "unsure", label: "Not Sure", description: "I need help figuring it out" },
];

const discountOptions = [
  { value: "student", label: "Student", description: "Currently enrolled in post-secondary" },
  { value: "alumni", label: "Alumni Association", description: "Member of a university alumni group" },
  { value: "professional", label: "Professional Association", description: "Member of a regulated professional body" },
  { value: "employer", label: "Employer Group", description: "My employer offers group insurance rates" },
  { value: "none", label: "None of these", description: "I don't belong to any affinity groups" },
];

const tenantCoverageOptions = [
  { value: "basic", label: "Basic", description: "Personal liability + contents", price: "From $15/mo" },
  { value: "standard", label: "Standard", description: "Basic + additional living expenses", price: "From $25/mo" },
  { value: "comprehensive", label: "Comprehensive", description: "Full coverage including sewer backup & identity theft", price: "From $40/mo" },
];

// ── Landlord property detail options ──
const propertyTypeOptions = [
  "Detached", "Semi-Detached", "Townhouse / Row", "Multi-Unit Residential",
  "Condo", "Duplex", "Triplex",
];
const constructionOptions = [
  "Brick", "Brick Veneer", "Frame with Vinyl Siding", "Frame with Aluminum Siding",
  "Concrete Block", "Stone", "Stucco", "Other",
];
const heatingOptions = [
  "Forced Air Gas", "Forced Air Electric", "Baseboard Electric",
  "Hot Water Radiator", "Radiant In-Floor", "Heat Pump", "Other",
];
const roofOptions = [
  "Asphalt Shingle", "Metal", "Flat (Modified Bitumen)", "Flat (EPDM/TPO)",
  "Cedar Shake", "Slate", "Tile", "Other",
];
const basementOptions = [
  "Full, Finished", "Full, Unfinished", "Full, Partially Finished",
  "Partial, Finished", "Partial, Unfinished", "Crawl Space", "None",
];

const landlordInsuredOptions = [
  { value: "yes", label: "Yes", description: "I currently have landlord insurance" },
  { value: "no", label: "No", description: "I don't have coverage right now" },
  { value: "unsure", label: "Not Sure", description: "I need help figuring it out" },
];

// ── Step definitions ──
const TENANT_STEPS = [
  { id: "owner-type", label: "Type" },
  { id: "currently-insured", label: "Insured?" },
  { id: "discounts", label: "Discounts" },
  { id: "coverage", label: "Coverage" },
  { id: "contact", label: "Contact" },
  { id: "share-quote", label: "Share" },
];

const LANDLORD_STEPS = [
  { id: "owner-type", label: "Type" },
  { id: "property-details", label: "Property" },
  { id: "rental-details", label: "Rental" },
  { id: "quote-result", label: "Quote" },
  { id: "contact", label: "Contact" },
  { id: "share-quote", label: "Share" },
];

// ── Form data shape ──
interface FormData {
  address: string;
  ownerType: string;
  // Tenant
  discount: string;
  currentlyInsured: string;
  coverage: string;
  coverageStartDate: Date | null;
  creditConsent: boolean;
  // Landlord – property (auto-populated)
  propertyType: string;
  yearBuilt: string;
  sqft: string;
  constructionType: string;
  units: string;
  storeys: string;
  heating: string;
  roof: string;
  basement: string;
  replacementCost: string;
  // Landlord – rental / coverage questions
  rentalIncome: string;
  isVacant: boolean;
  claimsHistory: number;
  shortTermRental: boolean;
  liabilityLimit: string;
  selectedPlan: string;
  // Contact
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const Quote = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const address = searchParams.get("address") || "";

  const [currentStep, setCurrentStep] = useState(0);
  const [partnerEmails, setPartnerEmails] = useState<string[]>([""]);
  const [propertyLoading, setPropertyLoading] = useState(false);
  const [premiums, setPremiums] = useState<PremiumTiers | null>(null);

  const [formData, setFormData] = useState<FormData>({
    address,
    ownerType: "",
    discount: "",
    currentlyInsured: "",
    coverage: "",
    coverageStartDate: null,
    creditConsent: false,
    propertyType: "",
    yearBuilt: "",
    sqft: "",
    constructionType: "",
    units: "",
    storeys: "",
    heating: "",
    roof: "",
    basement: "",
    replacementCost: "",
    rentalIncome: "",
    isVacant: false,
    claimsHistory: 0,
    shortTermRental: false,
    liabilityLimit: "2000000",
    selectedPlan: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const flow = formData.ownerType;
  const steps = flow === "tenant" ? TENANT_STEPS : flow === "landlord" ? LANDLORD_STEPS : [{ id: "owner-type", label: "Type" }];
  const currentStepId = steps[currentStep]?.id || "owner-type";

  const canProceed = (): boolean => {
    switch (currentStepId) {
      case "owner-type": return !!formData.ownerType;
      case "currently-insured": return !!formData.currentlyInsured;
      case "discounts": return !!formData.discount;
      case "coverage": return !!formData.coverage && !!formData.coverageStartDate;
      case "property-details": return !!formData.yearBuilt && !propertyLoading;
      case "rental-details": return !!formData.rentalIncome;
      case "quote-result": return !!formData.selectedPlan;
      case "contact": return !!formData.firstName && !!formData.email;
      case "share-quote": return true;
      default: return false;
    }
  };

  const handleNext = () => {
    // When moving from owner-type to property-details for landlord, auto-populate
    if (currentStepId === "owner-type" && formData.ownerType === "landlord") {
      setCurrentStep((s) => s + 1);
      setPropertyLoading(true);
      setTimeout(() => {
        const data = lookupProperty(formData.address);
        setFormData((prev) => ({
          ...prev,
          propertyType: data.propertyType,
          yearBuilt: String(data.yearBuilt),
          sqft: String(data.sqft),
          constructionType: data.constructionType,
          units: String(data.units),
          storeys: String(data.storeys),
          heating: data.heating,
          roof: data.roof,
          basement: data.basement,
          replacementCost: String(data.replacementCost),
        }));
        setPropertyLoading(false);
      }, 1500);
      return;
    }

    // When moving to quote-result, calculate premiums
    if (currentStepId === "rental-details") {
      const p = calcPremium({
        replacementCost: parseInt(formData.replacementCost) || 400000,
        units: parseInt(formData.units) || 1,
        yearBuilt: parseInt(formData.yearBuilt) || 1990,
        heating: formData.heating,
        claimsHistory: formData.claimsHistory,
        isVacant: formData.isVacant,
        shortTermRental: formData.shortTermRental,
      });
      setPremiums(p);
    }

    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      if (currentStep === 1) {
        setCurrentStep(0);
        setFormData((prev) => ({ ...prev, ownerType: "" }));
      } else {
        setCurrentStep((s) => s - 1);
      }
    }
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField("phone", formatPhone(e.target.value));
  };

  const handleSubmit = () => {
    const validPartnerEmails = partnerEmails.filter((e) => e.trim() !== "");
    const allRecipients = [formData.email, ...validPartnerEmails].join(", ");
    alert("Thank you! We'll send your quote to: " + allRecipients);
    navigate("/");
  };

  const addPartnerEmail = () => setPartnerEmails((prev) => [...prev, ""]);
  const updatePartnerEmail = (index: number, value: string) =>
    setPartnerEmails((prev) => prev.map((e, i) => (i === index ? value : e)));
  const removePartnerEmail = (index: number) =>
    setPartnerEmails((prev) => prev.filter((_, i) => i !== index));

  const handleOwnerTypeSelect = (value: string) => updateField("ownerType", value);

  // ── Shared input class ──
  const inputClass = "w-full h-12 px-4 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
  const selectClass = "w-full h-12 px-3 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer";

  // ── Render step content ──
  const renderStep = () => {
    // Homeowner coming-soon
    if (formData.ownerType === "homeowner") {
      return (
        <div className="space-y-6 text-center py-8">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
            <Home className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl mb-3">Homeowner Insurance — Coming Soon!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              We're partnering with a top-rated home insurance provider to bring you great rates. Leave your email and we'll notify you as soon as it's available.
            </p>
          </div>
          <div className="max-w-sm mx-auto space-y-3">
            <input type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)}
              placeholder="your@email.com" className={inputClass} />
            <Button variant="hero" className="w-full" disabled={!formData.email}
              onClick={() => { alert("Thanks! We'll notify " + formData.email + " when homeowner insurance launches."); navigate("/"); }}>
              Notify Me
            </Button>
          </div>
          <button onClick={() => { updateField("ownerType", ""); setCurrentStep(0); }}
            className="text-sm text-muted-foreground hover:text-foreground underline">← Go back</button>
        </div>
      );
    }

    switch (currentStepId) {
      case "owner-type":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl mb-2">What type of coverage do you need?</h2>
              <p className="text-muted-foreground">Select the option that best describes you.</p>
            </div>
            <div className="space-y-3">
              {ownerTypes.map((opt) => (
                <SelectionCard key={opt.value} selected={formData.ownerType === opt.value}
                  onClick={() => handleOwnerTypeSelect(opt.value)} label={opt.label} description={opt.description} />
              ))}
            </div>
          </div>
        );

      // ── Tenant steps ──
      case "currently-insured":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl mb-2">
                {flow === "tenant" ? "Do you currently have tenant insurance?" : "Is your property currently insured?"}
              </h2>
              <p className="text-muted-foreground">This helps us find the best rate for you.</p>
            </div>
            <div className="space-y-3">
              {(flow === "tenant" ? tenantInsuredOptions : landlordInsuredOptions).map((opt) => (
                <SelectionCard key={opt.value} selected={formData.currentlyInsured === opt.value}
                  onClick={() => updateField("currentlyInsured", opt.value)} label={opt.label} description={opt.description} />
              ))}
            </div>
          </div>
        );

      case "discounts":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl mb-2">Do you qualify for a group discount?</h2>
              <p className="text-muted-foreground">Select any affinity group you belong to for potential savings.</p>
            </div>
            <div className="space-y-3">
              {discountOptions.map((opt) => (
                <SelectionCard key={opt.value} selected={formData.discount === opt.value}
                  onClick={() => updateField("discount", opt.value)} label={opt.label} description={opt.description} />
              ))}
            </div>
          </div>
        );

      case "coverage":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl mb-2">Choose your coverage level</h2>
              <p className="text-muted-foreground">You can always adjust this later.</p>
            </div>
            <div className="space-y-3">
              {tenantCoverageOptions.map((opt) => (
                <SelectionCard key={opt.value} selected={formData.coverage === opt.value}
                  onClick={() => updateField("coverage", opt.value)} label={opt.label} description={opt.description} extra={opt.price} />
              ))}
            </div>

            {/* Coverage Start Date */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold tracking-wide text-foreground flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-accent" /> When do you need coverage to start? *
              </h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline"
                    className={cn("w-full h-12 justify-start text-left font-normal", !formData.coverageStartDate && "text-muted-foreground")}>
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {formData.coverageStartDate ? format(formData.coverageStartDate, "PPP") : "Select a future date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={formData.coverageStartDate || undefined}
                    onSelect={(date) => setFormData((prev) => ({ ...prev, coverageStartDate: date || null }))}
                    disabled={(date) => date <= new Date()} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>

            {/* Credit consent */}
            <div className="rounded-xl border-2 border-border bg-card p-5 space-y-4">
              <h3 className="font-semibold text-foreground">You could save more on your insurance!</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                I allow Cedar Insurance to use the information I've provided to do a soft credit check now
                and during any policy update or renewal. I understand this <strong className="text-foreground">will not</strong> affect my credit score.
              </p>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.creditConsent}
                  onChange={(e) => setFormData((prev) => ({ ...prev, creditConsent: e.target.checked }))}
                  className="h-5 w-5 rounded border-2 border-muted-foreground/30 accent-accent" />
                <span className="text-sm font-medium text-foreground">I agree</span>
              </label>
            </div>
          </div>
        );

      // ── Landlord: Property Details (auto-populated) ──
      case "property-details":
        if (propertyLoading) {
          return (
            <div className="text-center py-14 space-y-4">
              <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto" />
              <p className="text-muted-foreground">Looking up property details...</p>
              <p className="text-sm text-muted-foreground/60">Pulling data from MPAC & municipal records</p>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl mb-2">Confirm your property details</h2>
              <p className="text-muted-foreground">We auto-populated what we could. Please verify and correct.</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-accent/10 px-4 py-3">
              <Info className="w-4 h-4 text-accent flex-shrink-0" />
              <span className="text-xs text-accent">Data sourced from MPAC & municipal records. ✦ = auto-filled.</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Property Type */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Property Type ✦</label>
                <select value={formData.propertyType} onChange={(e) => updateField("propertyType", e.target.value)} className={selectClass}>
                  <option value="" disabled>Select</option>
                  {propertyTypeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              {/* Year Built */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Year Built ✦</label>
                <input type="number" value={formData.yearBuilt} onChange={(e) => updateField("yearBuilt", e.target.value)}
                  placeholder="e.g. 1987" className={inputClass} />
              </div>
              {/* Sqft */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Square Footage ✦</label>
                <input type="number" value={formData.sqft} onChange={(e) => updateField("sqft", e.target.value)}
                  placeholder="e.g. 1450" className={inputClass} />
              </div>
              {/* Units */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Units ✦</label>
                <select value={formData.units} onChange={(e) => updateField("units", e.target.value)} className={selectClass}>
                  <option value="" disabled>Select</option>
                  {["1","2","3","4","5+"].map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              {/* Storeys */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Storeys ✦</label>
                <select value={formData.storeys} onChange={(e) => updateField("storeys", e.target.value)} className={selectClass}>
                  <option value="" disabled>Select</option>
                  {["1","1.5","2","2.5","3"].map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              {/* Construction */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Construction ✦</label>
                <select value={formData.constructionType} onChange={(e) => updateField("constructionType", e.target.value)} className={selectClass}>
                  <option value="" disabled>Select</option>
                  {constructionOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              {/* Heating */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Heating ✦</label>
                <select value={formData.heating} onChange={(e) => updateField("heating", e.target.value)} className={selectClass}>
                  <option value="" disabled>Select</option>
                  {heatingOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              {/* Roof */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Roof ✦</label>
                <select value={formData.roof} onChange={(e) => updateField("roof", e.target.value)} className={selectClass}>
                  <option value="" disabled>Select</option>
                  {roofOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              {/* Basement */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Basement ✦</label>
                <select value={formData.basement} onChange={(e) => updateField("basement", e.target.value)} className={selectClass}>
                  <option value="" disabled>Select</option>
                  {basementOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              {/* Replacement Cost */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Replacement Cost ✦</label>
                <input type="number" value={formData.replacementCost}
                  onChange={(e) => updateField("replacementCost", e.target.value)}
                  placeholder="e.g. 425000" className={inputClass} />
              </div>
            </div>
          </div>
        );

      // ── Landlord: Rental / Coverage Questions ──
      case "rental-details":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl mb-2">Tell us about your rental</h2>
              <p className="text-muted-foreground">A few more questions to finalize your quote.</p>
            </div>

            {/* Rental Income */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Monthly Rental Income (all units)</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</div>
                <input type="number" value={formData.rentalIncome}
                  onChange={(e) => updateField("rentalIncome", e.target.value)}
                  placeholder="e.g. 3200"
                  className={cn(inputClass, "pl-8")} />
              </div>
            </div>

            {/* Occupied? */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Currently occupied?</label>
              <div className="flex gap-3">
                <SelectionCard selected={formData.isVacant === false} onClick={() => updateField("isVacant", false)} label="Yes, occupied" />
                <SelectionCard selected={formData.isVacant === true} onClick={() => updateField("isVacant", true)} label="No, vacant" />
              </div>
            </div>

            {/* Claims */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Claims in past 5 years?</label>
              <div className="grid grid-cols-4 gap-2">
                {[{ v: 0, l: "None" }, { v: 1, l: "1" }, { v: 2, l: "2" }, { v: 3, l: "3+" }].map((o) => (
                  <SelectionCard key={o.v} selected={formData.claimsHistory === o.v}
                    onClick={() => updateField("claimsHistory", o.v)} label={o.l} />
                ))}
              </div>
            </div>

            {/* Short-term rental */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Short-term rental use (Airbnb, VRBO)?</label>
              <div className="flex gap-3">
                <SelectionCard selected={formData.shortTermRental === false}
                  onClick={() => updateField("shortTermRental", false)} label="No" />
                <SelectionCard selected={formData.shortTermRental === true}
                  onClick={() => updateField("shortTermRental", true)} label="Yes" />
              </div>
            </div>

            {/* Liability */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Liability Coverage</label>
              <select value={formData.liabilityLimit} onChange={(e) => updateField("liabilityLimit", e.target.value)} className={selectClass}>
                <option value="1000000">$1,000,000</option>
                <option value="2000000">$2,000,000</option>
                <option value="3000000">$3,000,000</option>
                <option value="5000000">$5,000,000</option>
              </select>
            </div>
          </div>
        );

      // ── Landlord: Quote Result with Tier Cards ──
      case "quote-result":
        if (!premiums) return null;
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-3">
                <Shield className="w-7 h-7 text-accent" />
              </div>
              <h2 className="text-2xl md:text-3xl mb-1">Your Coverage Options</h2>
              <p className="text-muted-foreground">{formData.address}</p>
              <p className="text-sm text-muted-foreground/60">
                {formData.propertyType} · {formData.units} unit{parseInt(formData.units) > 1 ? "s" : ""} · Built {formData.yearBuilt}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {COVERAGE_TIERS.map((tier) => (
                <TierCard
                  key={tier.key}
                  tier={tier.name}
                  price={premiums[tier.key]}
                  features={tier.features(parseInt(formData.replacementCost) || 400000)}
                  recommended={tier.recommended}
                  selected={formData.selectedPlan === tier.key}
                  onSelect={() => updateField("selectedPlan", tier.key)}
                />
              ))}
            </div>

            {formData.selectedPlan && (
              <div className="bg-accent/10 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-sm font-semibold text-accent">
                    Selected: {formData.selectedPlan.charAt(0).toUpperCase() + formData.selectedPlan.slice(1)} Plan
                  </p>
                  <p className="text-2xl font-extrabold text-accent">
                    ${premiums[formData.selectedPlan as keyof PremiumTiers].toLocaleString()}/yr
                    <span className="text-sm font-normal text-accent/60 ml-2">
                      (${Math.round(premiums[formData.selectedPlan as keyof PremiumTiers] / 12)}/mo)
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      // ── Contact ──
      case "contact":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl mb-2">Almost there! How can we reach you?</h2>
              <p className="text-muted-foreground">We'll send your personalized quote by email.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">First Name *</label>
                <input type="text" value={formData.firstName} onChange={(e) => updateField("firstName", e.target.value)}
                  placeholder="Jane" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Last Name</label>
                <input type="text" value={formData.lastName} onChange={(e) => updateField("lastName", e.target.value)}
                  placeholder="Smith" className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">Email Address *</label>
                <input type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)}
                  placeholder="jane@example.com" className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">Phone (optional)</label>
                <input type="tel" value={formData.phone} onChange={handlePhoneChange}
                  placeholder="416-555-0123" maxLength={12} className={inputClass} />
              </div>
            </div>
          </div>
        );

      // ── Share Quote ──
      case "share-quote":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl mb-2">Share your quote with partners</h2>
              <p className="text-muted-foreground">
                Optionally send a copy of your bindable quote to your real estate agent, lender, mortgage broker, property manager, or anyone else involved.
              </p>
            </div>
            <div className="rounded-xl border-2 border-border bg-card p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">Partner Emails</h3>
                <span className="text-xs text-muted-foreground">(optional)</span>
              </div>
              <div className="space-y-3">
                {partnerEmails.map((email, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input type="email" value={email} onChange={(e) => updatePartnerEmail(index, e.target.value)}
                      placeholder={index === 0 ? "e.g. agent@realestate.com" : index === 1 ? "e.g. broker@mortgage.com" : "e.g. manager@property.com"}
                      className={cn("flex-1", inputClass)} />
                    {partnerEmails.length > 1 && (
                      <button onClick={() => removePartnerEmail(index)}
                        className="h-10 w-10 rounded-lg border border-input bg-background flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addPartnerEmail} className="gap-2">
                <Plus className="w-4 h-4" /> Add another email
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your quote will always be sent to <span className="font-medium text-foreground">{formData.email}</span>. Any partner emails above will receive a copy.
            </p>
          </div>
        );
    }
  };

  const isHomeowner = formData.ownerType === "homeowner";
  const isQuoteResult = currentStepId === "quote-result";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container py-12 md:py-20">
          <div className={cn("mx-auto", isQuoteResult ? "max-w-4xl" : "max-w-2xl")}>
            {!isHomeowner && <QuoteProgressBar steps={steps} currentStep={currentStep} />}

            {address && !isHomeowner && (
              <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2.5">
                <Home className="h-4 w-4 text-accent" />
                <span className="font-medium text-foreground">{address}</span>
              </div>
            )}

            <div className="animate-fade-in-up">{renderStep()}</div>

            {!isHomeowner && (
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
                <Button variant="outline" onClick={currentStep === 0 ? () => navigate("/") : handleBack} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {currentStep === 0 ? "Home" : "Back"}
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button variant="hero" onClick={handleNext} disabled={!canProceed()} className="gap-2">
                    {currentStepId === "rental-details" ? "Get My Quote" : "Continue"} <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="hero" onClick={handleSubmit} disabled={!canProceed()} className="gap-2">
                    Get My Quote <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Quote;
