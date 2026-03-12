import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { format, addYears } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, ArrowRight, CheckCircle, Home, Shield, User, Phone,
  Building2, Calendar as CalendarIcon, Layers, Users, Tag, Plus, X,
  Mail, HelpCircle, Wrench, Clock, CalendarDays, Info, Loader2,
  CreditCard, FileText, Download, ExternalLink, Lock,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SelectionCard from "@/components/quote/SelectionCard";
import QuoteProgressBar from "@/components/quote/QuoteProgressBar";
import TierCard from "@/components/quote/TierCard";
import CustomTierCard from "@/components/quote/CustomTierCard";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { lookupProperty, type PropertyData } from "@/lib/propertyData";
import {
  rateLandlordQuote,
  PROPERTY_TYPE_OPTIONS,
  CONSTRUCTION_OPTIONS,
  HEATING_OPTIONS,
  ROOF_OPTIONS,
  BASEMENT_OPTIONS,
  TIER_DETAILS,
  buildTierFeatures,
  type RatingBreakdown,
  rateTenantQuote,
  UNIT_TYPE_OPTIONS,
  type TenantRatingBreakdown,
} from "@/lib/ratingEngine";
import { LandlordPremiumBreakdown, TenantPremiumBreakdown } from "@/components/PremiumBreakdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { downloadCertificate, type CertificateData } from "@/lib/generateCertificate";
import { useToast } from "@/hooks/use-toast";

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
  { id: "bind-checkout", label: "Bind" },
  { id: "confirmation", label: "Confirmed" },
];

const LANDLORD_STEPS = [
  { id: "owner-type", label: "Type" },
  { id: "property-details", label: "Property" },
  { id: "rental-details", label: "Rental" },
  { id: "quote-result", label: "Quote" },
  { id: "bind-checkout", label: "Bind" },
  { id: "confirmation", label: "Confirmed" },
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
  // Contact / Insured
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Bind fields
  legalFirstName: string;
  legalLastName: string;
  mailingAddress: string;
  additionalInsuredName: string;
  additionalInsuredType: string;
  additionalInsuredEmail: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  termsAccepted: boolean;
}

// Policy number generator
function generatePolicyNumber(): string {
  const prefix = "CDR";
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${year}-${random}`;
}

const Quote = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const address = searchParams.get("address") || "";

  const [currentStep, setCurrentStep] = useState(0);
  const [partnerEmails, setPartnerEmails] = useState<string[]>([""]);
  const [propertyLoading, setPropertyLoading] = useState(false);
  const [rating, setRating] = useState<RatingBreakdown | null>(null);
  const [bindingInProgress, setBindingInProgress] = useState(false);
  const [boundPolicy, setBoundPolicy] = useState<{
    policyNumber: string;
    effectiveDate: string;
    expiryDate: string;
  } | null>(null);
  const [tenantRating, setTenantRating] = useState<TenantRatingBreakdown | null>(null);
  const [customDwelling, setCustomDwelling] = useState(400000);
  const [customDeductible, setCustomDeductible] = useState(1000);
  const [customLiability, setCustomLiability] = useState(2000000);

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
    legalFirstName: "",
    legalLastName: "",
    mailingAddress: "",
    additionalInsuredName: "",
    additionalInsuredType: "Mortgage Lender",
    additionalInsuredEmail: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    termsAccepted: false,
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
      case "bind-checkout":
        return !!formData.legalFirstName && !!formData.legalLastName && !!formData.email
          && !!formData.mailingAddress && !!formData.cardNumber && !!formData.cardExpiry
          && !!formData.cardCvc && formData.termsAccepted;
      case "confirmation": return true;
      case "contact": return !!formData.firstName && !!formData.email;
      case "share-quote": return true;
      default: return false;
    }
  };

  const handleBindPolicy = async () => {
    const isTenant = flow === "tenant";
    const isLandlord = flow === "landlord";

    if (isLandlord && (!rating || !formData.selectedPlan)) return;
    if (isTenant && !tenantRating) return;

    setBindingInProgress(true);

    const policyNumber = generatePolicyNumber();
    const effectiveDate = formData.coverageStartDate
      ? format(formData.coverageStartDate, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd");
    const expiryDate = formData.coverageStartDate
      ? format(addYears(formData.coverageStartDate, 1), "yyyy-MM-dd")
      : format(addYears(new Date(), 1), "yyyy-MM-dd");

    if (user) {
      try {
        let insertData: any;

        if (isLandlord && rating) {
          const tierKey = formData.selectedPlan as "basic" | "standard" | "premium";
          const tierData = rating.tiers[tierKey];
          const liabilityLabel = tierKey === "basic" ? "$1,000,000" : tierKey === "standard" ? "$2,000,000" : "$5,000,000";

          insertData = {
            user_id: user.id,
            policy_number: policyNumber,
            status: "active",
            address: formData.address,
            property_type: formData.propertyType,
            year_built: parseInt(formData.yearBuilt) || null,
            sqft: parseInt(formData.sqft) || null,
            units: parseInt(formData.units) || 1,
            construction_type: formData.constructionType,
            heating_type: formData.heating,
            roof_type: formData.roof,
            replacement_cost: parseInt(formData.replacementCost) || 400000,
            tier: tierKey,
            annual_premium: tierData.annual,
            monthly_premium: tierData.monthly,
            liability_limit: liabilityLabel,
            rental_income_limit: rating.rentalIncomeLimits[tierKey],
            effective_date: effectiveDate,
            expiry_date: expiryDate,
            insured_first_name: formData.legalFirstName,
            insured_last_name: formData.legalLastName,
            insured_email: formData.email,
            insured_phone: formData.phone || null,
            mailing_address: formData.mailingAddress,
            additional_insured_name: formData.additionalInsuredName || null,
            additional_insured_type: formData.additionalInsuredName ? formData.additionalInsuredType : null,
            additional_insured_email: formData.additionalInsuredEmail || null,
            payment_method: "simulated",
            payment_last_four: formData.cardNumber.slice(-4),
          };
        } else if (isTenant && tenantRating) {
          const coverageLabel = formData.coverage.charAt(0).toUpperCase() + formData.coverage.slice(1);
          insertData = {
            user_id: user.id,
            policy_number: policyNumber,
            status: "active",
            address: formData.address,
            property_type: "Tenant",
            tier: formData.coverage,
            annual_premium: tenantRating.annual,
            monthly_premium: tenantRating.monthly,
            liability_limit: "$1,000,000",
            effective_date: effectiveDate,
            expiry_date: expiryDate,
            insured_first_name: formData.legalFirstName,
            insured_last_name: formData.legalLastName,
            insured_email: formData.email,
            insured_phone: formData.phone || null,
            mailing_address: formData.mailingAddress,
            additional_insured_name: formData.additionalInsuredName || null,
            additional_insured_type: formData.additionalInsuredName ? formData.additionalInsuredType : null,
            additional_insured_email: formData.additionalInsuredEmail || null,
            payment_method: "simulated",
            payment_last_four: formData.cardNumber.slice(-4),
          };
        }

        if (insertData) {
          const { error } = await supabase.from("policies" as any).insert(insertData as any);
          if (error) {
            console.error("Policy save error:", error);
            toast({ title: "Policy saved locally", description: "Your policy was bound but could not be saved to your account.", variant: "destructive" });
          }
        }
      } catch (err) {
        console.error("Policy save exception:", err);
      }
    }

    await new Promise((r) => setTimeout(r, 1500));
    setBoundPolicy({ policyNumber, effectiveDate, expiryDate });
    setBindingInProgress(false);
    setCurrentStep((s) => s + 1);
  };

  const handleNext = () => {
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

    if (currentStepId === "rental-details") {
      const r = rateLandlordQuote({
        propertyType: formData.propertyType,
        yearBuilt: parseInt(formData.yearBuilt) || 1990,
        sqft: parseInt(formData.sqft) || 1200,
        units: parseInt(formData.units) || 1,
        constructionType: formData.constructionType,
        heatingType: formData.heating,
        roofType: formData.roof,
        replacementCost: parseInt(formData.replacementCost) || 400000,
        monthlyRentalIncome: parseInt(formData.rentalIncome) || 0,
        isVacant: formData.isVacant,
        claimsHistory: formData.claimsHistory,
        shortTermRental: formData.shortTermRental,
      });
      setRating(r);
    }

    // Pre-fill bind legal name from contact info when moving to bind step
    if (currentStepId === "quote-result" || currentStepId === "contact") {
      setFormData((prev) => ({
        ...prev,
        legalFirstName: prev.legalFirstName || prev.firstName,
        legalLastName: prev.legalLastName || prev.lastName,
      }));
    }

    // Compute tenant rating and set default additional insured type when moving from contact to bind
    if (flow === "tenant" && currentStepId === "contact") {
      const tr = rateTenantQuote({
        unitType: "apartment",
        contentsValue: formData.coverage === "basic" ? 25000 : formData.coverage === "standard" ? 40000 : 60000,
        liabilityLimit: "1000000",
        deductible: 1000,
        hasHighValueItems: false,
      });
      setTenantRating(tr);
      setFormData((prev) => ({
        ...prev,
        additionalInsuredType: prev.additionalInsuredType === "Mortgage Lender" ? "Landlord" : prev.additionalInsuredType,
      }));
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

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
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

  const getCertificateData = (): CertificateData | null => {
    if (!boundPolicy) return null;

    // Landlord
    if (flow === "landlord" && rating && formData.selectedPlan) {
      const tierKey = formData.selectedPlan as "basic" | "standard" | "premium";
      const tierData = rating.tiers[tierKey];
      const liabilityLabel = tierKey === "basic" ? "$1,000,000" : tierKey === "standard" ? "$2,000,000" : "$5,000,000";
      return {
        policyNumber: boundPolicy.policyNumber,
        insuredName: `${formData.legalFirstName} ${formData.legalLastName}`,
        mailingAddress: formData.mailingAddress,
        propertyAddress: formData.address,
        effectiveDate: boundPolicy.effectiveDate,
        expiryDate: boundPolicy.expiryDate,
        tier: tierKey,
        annualPremium: tierData.annual,
        monthlyPremium: tierData.monthly,
        liabilityLimit: liabilityLabel,
        replacementCost: parseInt(formData.replacementCost) || 400000,
        rentalIncomeLimit: rating.rentalIncomeLimits[tierKey],
        additionalInsuredName: formData.additionalInsuredName || undefined,
        additionalInsuredType: formData.additionalInsuredType || undefined,
      };
    }

    // Tenant
    if (flow === "tenant" && tenantRating) {
      return {
        policyNumber: boundPolicy.policyNumber,
        insuredName: `${formData.legalFirstName} ${formData.legalLastName}`,
        mailingAddress: formData.mailingAddress,
        propertyAddress: formData.address,
        effectiveDate: boundPolicy.effectiveDate,
        expiryDate: boundPolicy.expiryDate,
        tier: formData.coverage,
        annualPremium: tenantRating.annual,
        monthlyPremium: tenantRating.monthly,
        liabilityLimit: "$1,000,000",
        replacementCost: 0,
        rentalIncomeLimit: 0,
        additionalInsuredName: formData.additionalInsuredName || undefined,
        additionalInsuredType: formData.additionalInsuredType || undefined,
      };
    }

    return null;
  };

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
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-1">
                  Property Type ✦
                  <Tooltip><TooltipTrigger asChild><HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent className="max-w-[220px] text-xs">E.g. Detached, Semi-Detached, Townhouse, Condo, or Multi-Unit Residential.</TooltipContent></Tooltip>
                </label>
                <select value={formData.propertyType} onChange={(e) => updateField("propertyType", e.target.value)} className={selectClass}>
                  <option value="" disabled>Select</option>
                  {PROPERTY_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-1">
                  Year Built ✦
                  <Tooltip><TooltipTrigger asChild><HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent className="max-w-[220px] text-xs">The year the building was originally constructed. Older buildings may have different risk profiles.</TooltipContent></Tooltip>
                </label>
                <input type="number" value={formData.yearBuilt} onChange={(e) => updateField("yearBuilt", e.target.value)}
                  placeholder="e.g. 1987" className={inputClass} />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-1">
                  Square Footage ✦
                  <Tooltip><TooltipTrigger asChild><HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent className="max-w-[220px] text-xs">Total above-grade living area in square feet. Excludes unfinished basement space.</TooltipContent></Tooltip>
                </label>
                <input type="number" value={formData.sqft} onChange={(e) => updateField("sqft", e.target.value)}
                  placeholder="e.g. 1450" className={inputClass} />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-1">
                  Units ✦
                  <Tooltip><TooltipTrigger asChild><HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent className="max-w-[220px] text-xs">Number of separate rental units in the building. A single-family home = 1 unit.</TooltipContent></Tooltip>
                </label>
                <select value={formData.units} onChange={(e) => updateField("units", e.target.value)} className={selectClass}>
                  <option value="" disabled>Select</option>
                  {["1","2","3","4","5+"].map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-1">
                  Storeys ✦
                  <Tooltip><TooltipTrigger asChild><HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent className="max-w-[240px] text-xs">Number of above-grade levels. A "half storey" (e.g. 1.5) means the top floor has a sloped ceiling with reduced living area, like a finished attic.</TooltipContent></Tooltip>
                </label>
                <select value={formData.storeys} onChange={(e) => updateField("storeys", e.target.value)} className={selectClass}>
                  <option value="" disabled>Select</option>
                  {["1","1.5","2","2.5","3"].map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-1">
                  Construction ✦
                  <Tooltip><TooltipTrigger asChild><HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent className="max-w-[240px] text-xs">Primary building material. E.g. "Brick Veneer" = wood frame with brick exterior; "Frame" = wood or steel frame with siding.</TooltipContent></Tooltip>
                </label>
                <select value={formData.constructionType} onChange={(e) => updateField("constructionType", e.target.value)} className={selectClass}>
                  <option value="" disabled>Select</option>
                  {CONSTRUCTION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-1">
                  Heating ✦
                  <Tooltip><TooltipTrigger asChild><HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent className="max-w-[240px] text-xs">Main heating system. "Forced Air Gas" = furnace with ducts; "Baseboard Electric" = electric heaters along walls; "Boiler" = hot water radiators.</TooltipContent></Tooltip>
                </label>
                <select value={formData.heating} onChange={(e) => updateField("heating", e.target.value)} className={selectClass}>
                  <option value="" disabled>Select</option>
                  {HEATING_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-1">
                  Roof ✦
                  <Tooltip><TooltipTrigger asChild><HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent className="max-w-[240px] text-xs">Roof covering material. "Asphalt Shingle" is most common; "Flat (Modified Bitumen)" is typical for multi-unit buildings with flat roofs.</TooltipContent></Tooltip>
                </label>
                <select value={formData.roof} onChange={(e) => updateField("roof", e.target.value)} className={selectClass}>
                  <option value="" disabled>Select</option>
                  {ROOF_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-1">
                  Basement ✦
                  <Tooltip><TooltipTrigger asChild><HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent className="max-w-[240px] text-xs">"Full" = extends under entire footprint; "Partial" = under part of the house; "Finished" = livable space; "Unfinished" = bare concrete/utility only.</TooltipContent></Tooltip>
                </label>
                <select value={formData.basement} onChange={(e) => updateField("basement", e.target.value)} className={selectClass}>
                  <option value="" disabled>Select</option>
                  {BASEMENT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-1">
                  Replacement Cost ✦
                  <Tooltip><TooltipTrigger asChild><HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent className="max-w-[240px] text-xs">The estimated cost to rebuild the structure from scratch at today's prices — not the market value or purchase price.</TooltipContent></Tooltip>
                </label>
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
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Monthly Rental Income (all units)</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</div>
                <input type="text" inputMode="numeric"
                  value={formData.rentalIncome ? parseInt(formData.rentalIncome).toLocaleString() : ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    updateField("rentalIncome", raw);
                  }}
                  placeholder="e.g. 3,200"
                  className={cn(inputClass, "pl-8")} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Currently occupied?</label>
              <div className="flex gap-3">
                <SelectionCard selected={formData.isVacant === false} onClick={() => updateField("isVacant", false)} label="Yes, occupied" />
                <SelectionCard selected={formData.isVacant === true} onClick={() => updateField("isVacant", true)} label="No, vacant" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Claims in past 5 years?</label>
              <div className="grid grid-cols-4 gap-2">
                {[{ v: 0, l: "None" }, { v: 1, l: "1" }, { v: 2, l: "2" }, { v: 3, l: "3+" }].map((o) => (
                  <SelectionCard key={o.v} selected={formData.claimsHistory === o.v}
                    onClick={() => updateField("claimsHistory", o.v)} label={o.l} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Short-term rental use (Airbnb, VRBO)?</label>
              <div className="flex gap-3">
                <SelectionCard selected={formData.shortTermRental === false}
                  onClick={() => updateField("shortTermRental", false)} label="No" />
                <SelectionCard selected={formData.shortTermRental === true}
                  onClick={() => updateField("shortTermRental", true)} label="Yes" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Liability Coverage</label>
              <select value={formData.liabilityLimit} onChange={(e) => updateField("liabilityLimit", e.target.value)} className={selectClass}>
                <option value="1000000">$1,000,000</option>
                <option value="2000000">$2,000,000</option>
                <option value="3000000">$3,000,000</option>
                <option value="5000000">$5,000,000</option>
              </select>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-accent" /> When do you need coverage to start?
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
          </div>
        );

      // ── Landlord: Quote Result with Tier Cards ──
      case "quote-result":
        if (!rating) return null;
        const rc = parseInt(formData.replacementCost) || 400000;
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
              {(["basic", "standard", "premium"] as const).map((tierKey) => {
                const detail = TIER_DETAILS[tierKey];
                const tierResult = rating.tiers[tierKey];
                return (
                  <TierCard
                    key={tierKey}
                    tier={detail.name}
                    price={tierResult.annual}
                    features={buildTierFeatures(tierKey, rc, rating.rentalIncomeLimits)}
                    recommended={detail.recommended}
                    selected={formData.selectedPlan === tierKey}
                    onSelect={() => updateField("selectedPlan", tierKey)}
                  />
                );
              })}
            </div>

            {formData.selectedPlan && (
              <>
                <div className="bg-accent/10 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-sm font-semibold text-accent">
                      Selected: {formData.selectedPlan.charAt(0).toUpperCase() + formData.selectedPlan.slice(1)} Plan
                    </p>
                    <p className="text-2xl font-extrabold text-accent">
                      ${rating.tiers[formData.selectedPlan as "basic" | "standard" | "premium"].monthly.toLocaleString()}/mo
                      <span className="text-sm font-normal text-accent/60 ml-2">
                        (${rating.tiers[formData.selectedPlan as "basic" | "standard" | "premium"].annual.toLocaleString()}/yr)
                      </span>
                    </p>
                  </div>
                </div>
                <LandlordPremiumBreakdown
                  input={{
                    propertyType: formData.propertyType,
                    yearBuilt: parseInt(formData.yearBuilt) || 1990,
                    sqft: parseInt(formData.sqft) || 1200,
                    units: parseInt(formData.units) || 1,
                    constructionType: formData.constructionType,
                    heatingType: formData.heating,
                    roofType: formData.roof,
                    replacementCost: parseInt((formData.replacementCost || '0').replace(/,/g, '')) || 400000,
                    monthlyRentalIncome: parseInt((formData.rentalIncome || '0').replace(/,/g, '')) || 0,
                    isVacant: formData.isVacant,
                    claimsHistory: formData.claimsHistory,
                    shortTermRental: formData.shortTermRental,
                  }}
                  rating={rating}
                  selectedTier={formData.selectedPlan as "basic" | "standard" | "premium"}
                />
              </>
            )}
          </div>
        );

      // ── Bind / Checkout (Landlord + Tenant) ──
      case "bind-checkout": {
        const isLandlordBind = flow === "landlord" && rating && formData.selectedPlan;
        const isTenantBind = flow === "tenant" && tenantRating;
        if (!isLandlordBind && !isTenantBind) return null;

        const premiumAnnual = isLandlordBind ? rating!.tiers[formData.selectedPlan as "basic" | "standard" | "premium"].annual : tenantRating!.annual;
        const premiumMonthly = isLandlordBind ? rating!.tiers[formData.selectedPlan as "basic" | "standard" | "premium"].monthly : tenantRating!.monthly;
        const coverageLabel = isLandlordBind
          ? (formData.selectedPlan.charAt(0).toUpperCase() + formData.selectedPlan.slice(1)) + " Plan"
          : (formData.coverage.charAt(0).toUpperCase() + formData.coverage.slice(1)) + " Tenant Coverage";
        const effectiveDate = formData.coverageStartDate ? format(formData.coverageStartDate, "PPP") : format(new Date(), "PPP");

        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-3">
                <Lock className="w-7 h-7 text-accent" />
              </div>
              <h2 className="text-2xl md:text-3xl mb-1">Bind Your Coverage</h2>
              <p className="text-muted-foreground">Review your details, add payment, and bind instantly.</p>
            </div>

            {/* Coverage Summary */}
            <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-5 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" /> {coverageLabel} — Coverage Summary
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">{isTenantBind ? "Address" : "Property"}</span><span className="font-medium text-foreground">{formData.address}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Premium</span><span className="font-bold text-accent">${premiumMonthly}/mo (${premiumAnnual.toLocaleString()}/yr)</span></div>
                {isLandlordBind && (
                  <>
                    <div className="flex justify-between"><span className="text-muted-foreground">Dwelling</span><span className="font-medium text-foreground">${(parseInt(formData.replacementCost) || 400000).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Liability</span><span className="font-medium text-foreground">{formData.selectedPlan === "basic" ? "$1,000,000" : formData.selectedPlan === "standard" ? "$2,000,000" : "$5,000,000"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Loss of Rent</span><span className="font-medium text-foreground">${rating!.rentalIncomeLimits[formData.selectedPlan as "basic" | "standard" | "premium"].toLocaleString()}</span></div>
                  </>
                )}
                {isTenantBind && (
                  <>
                    <div className="flex justify-between"><span className="text-muted-foreground">Liability</span><span className="font-medium text-foreground">$1,000,000</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Coverage Type</span><span className="font-medium text-foreground">{formData.coverage.charAt(0).toUpperCase() + formData.coverage.slice(1)}</span></div>
                  </>
                )}
                <div className="flex justify-between"><span className="text-muted-foreground">Effective</span><span className="font-medium text-foreground">{effectiveDate}</span></div>
              </div>
            </div>

            {/* Named Insured */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-accent" /> Named Insured (Legal Name)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Legal First Name *</label>
                  <input type="text" value={formData.legalFirstName} onChange={(e) => updateField("legalFirstName", e.target.value)}
                    placeholder="Jane" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Legal Last Name *</label>
                  <input type="text" value={formData.legalLastName} onChange={(e) => updateField("legalLastName", e.target.value)}
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
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">Mailing Address *</label>
                  <input type="text" value={formData.mailingAddress} onChange={(e) => updateField("mailingAddress", e.target.value)}
                    placeholder="123 Main St, Toronto, ON M5V 1A1" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Additional Insured */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-accent" /> Additional Insured
                <span className="text-xs font-normal text-muted-foreground">(optional — e.g. {isTenantBind ? "landlord, property manager" : "mortgage lender"})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">Name / Organization</label>
                  <input type="text" value={formData.additionalInsuredName} onChange={(e) => updateField("additionalInsuredName", e.target.value)}
                    placeholder={isTenantBind ? "e.g. John Smith (Landlord)" : "e.g. TD Bank, RBC Royal Bank"} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Type</label>
                  <select value={formData.additionalInsuredType} onChange={(e) => updateField("additionalInsuredType", e.target.value)} className={selectClass}>
                    {isTenantBind ? (
                      <>
                        <option value="Landlord">Landlord</option>
                        <option value="Property Manager">Property Manager</option>
                        <option value="Other">Other</option>
                      </>
                    ) : (
                      <>
                        <option value="Mortgage Lender">Mortgage Lender</option>
                        <option value="Property Manager">Property Manager</option>
                        <option value="Co-Owner">Co-Owner</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email (for COI delivery)</label>
                  <input type="email" value={formData.additionalInsuredEmail} onChange={(e) => updateField("additionalInsuredEmail", e.target.value)}
                    placeholder="lender@bank.com" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-accent" /> Payment Information
              </h3>
              <div className="rounded-xl border-2 border-border bg-card p-5 space-y-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Lock className="w-3 h-3" /> Secure simulated payment — no real charges
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Card Number *</label>
                  <input type="text" value={formData.cardNumber}
                    onChange={(e) => updateField("cardNumber", formatCardNumber(e.target.value))}
                    placeholder="4242 4242 4242 4242" maxLength={19} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Expiry *</label>
                    <input type="text" value={formData.cardExpiry}
                      onChange={(e) => updateField("cardExpiry", formatExpiry(e.target.value))}
                      placeholder="MM/YY" maxLength={5} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">CVC *</label>
                    <input type="text" value={formData.cardCvc}
                      onChange={(e) => updateField("cardCvc", e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="123" maxLength={4} className={inputClass} />
                  </div>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="rounded-xl border-2 border-border bg-card p-5 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.termsAccepted}
                  onChange={(e) => updateField("termsAccepted", e.target.checked)}
                  className="h-5 w-5 rounded border-2 border-muted-foreground/30 accent-accent mt-0.5" />
                <span className="text-sm text-muted-foreground leading-relaxed">
                  I confirm the information provided is accurate. I understand this policy is bound upon payment and is subject to the terms, conditions, and exclusions of the policy wording. I authorize Cedar Insurance to charge the premium shown above. I have read and agree to the{" "}
                  <a href="#" className="text-accent underline">Terms of Service</a> and{" "}
                  <a href="#" className="text-accent underline">Privacy Policy</a>.
                </span>
              </label>
            </div>
          </div>
        );
      }

      // ── Confirmation (Landlord + Tenant) ──
      case "confirmation": {
        if (!boundPolicy) return null;
        const isLandlordConfirm = flow === "landlord" && rating && formData.selectedPlan;
        const isTenantConfirm = flow === "tenant" && tenantRating;
        if (!isLandlordConfirm && !isTenantConfirm) return null;

        const confirmAnnual = isLandlordConfirm ? rating!.tiers[formData.selectedPlan as "basic" | "standard" | "premium"].annual : tenantRating!.annual;
        const confirmMonthly = isLandlordConfirm ? rating!.tiers[formData.selectedPlan as "basic" | "standard" | "premium"].monthly : tenantRating!.monthly;
        const confirmPlanLabel = isLandlordConfirm
          ? formData.selectedPlan.charAt(0).toUpperCase() + formData.selectedPlan.slice(1)
          : formData.coverage.charAt(0).toUpperCase() + formData.coverage.slice(1) + " Tenant";
        const certData = getCertificateData();

        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="w-9 h-9 text-green-600" />
              </div>
              <h2 className="text-2xl md:text-3xl mb-2">You're Covered!</h2>
              <p className="text-muted-foreground">Your policy has been bound successfully.</p>
            </div>

            {/* Policy details card */}
            <div className="rounded-2xl border-2 border-accent/30 bg-card p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Policy Number</p>
                  <p className="text-xl font-bold text-foreground font-mono">{boundPolicy.policyNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                    <span className="w-2 h-2 rounded-full bg-green-500" /> Active
                  </span>
                </div>
              </div>

              <div className="border-t border-border pt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Named Insured</p>
                  <p className="font-medium text-foreground">{formData.legalFirstName} {formData.legalLastName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Plan</p>
                  <p className="font-medium text-foreground">{confirmPlanLabel}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Premium</p>
                  <p className="font-bold text-accent">${confirmMonthly}/mo (${confirmAnnual.toLocaleString()}/yr)</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Property</p>
                  <p className="font-medium text-foreground">{formData.address}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Effective Date</p>
                  <p className="font-medium text-foreground">{boundPolicy.effectiveDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expiry Date</p>
                  <p className="font-medium text-foreground">{boundPolicy.expiryDate}</p>
                </div>
                {formData.additionalInsuredName && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Additional Insured</p>
                    <p className="font-medium text-foreground">{formData.additionalInsuredName} ({formData.additionalInsuredType})</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => certData && downloadCertificate(certData)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-accent bg-accent/5 text-accent font-semibold hover:bg-accent/10 transition-colors"
              >
                <Download className="w-4 h-4" /> Download COI
              </button>
              <button
                onClick={() => {
                  if (formData.additionalInsuredEmail) {
                    toast({ title: "Certificate sent", description: `COI emailed to ${formData.additionalInsuredEmail}` });
                  } else {
                    toast({ title: "No recipient", description: "No additional insured email was provided.", variant: "destructive" });
                  }
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-border bg-card text-foreground font-semibold hover:border-accent/30 transition-colors"
              >
                <Mail className="w-4 h-4" /> {isTenantConfirm ? "Email Certificate" : "Email to Lender"}
              </button>
              <button
                onClick={() => navigate("/portal")}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-border bg-card text-foreground font-semibold hover:border-accent/30 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Go to Portal
              </button>
            </div>

            {/* Email confirmation notice */}
            <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4">
              <Mail className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Confirmation email sent</p>
                <p className="text-xs text-muted-foreground">
                  A copy of your policy documents and certificate of insurance has been sent to{" "}
                  <span className="font-medium text-foreground">{formData.email}</span>.
                  {formData.additionalInsuredEmail && (
                    <> A certificate was also sent to <span className="font-medium text-foreground">{formData.additionalInsuredEmail}</span>.</>
                  )}
                </p>
              </div>
            </div>
          </div>
        );
      }

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
  const isBindCheckout = currentStepId === "bind-checkout";
  const isConfirmation = currentStepId === "confirmation";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container py-12 md:py-20">
          <div className={cn("mx-auto", isQuoteResult ? "max-w-4xl" : "max-w-2xl")}>
            {!isHomeowner && !isConfirmation && <QuoteProgressBar steps={steps} currentStep={currentStep} />}

            {address && !isHomeowner && !isConfirmation && (
              <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2.5">
                <Home className="h-4 w-4 text-accent" />
                <span className="font-medium text-foreground">{address}</span>
              </div>
            )}

            <div className="animate-fade-in-up">{renderStep()}</div>

            {!isHomeowner && !isConfirmation && (
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
                <Button variant="outline" onClick={currentStep === 0 ? () => navigate("/") : handleBack} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {currentStep === 0 ? "Home" : "Back"}
                </Button>

                {isBindCheckout ? (
                  <Button variant="hero" onClick={handleBindPolicy} disabled={!canProceed() || bindingInProgress} className="gap-2">
                    {bindingInProgress ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                      <><Lock className="h-4 w-4" /> Bind & Pay</>
                    )}
                  </Button>
                ) : currentStep < steps.length - 1 ? (
                  <Button variant="hero" onClick={handleNext} disabled={!canProceed()} className="gap-2">
                    {currentStepId === "rental-details" ? "Get My Quote" : currentStepId === "quote-result" ? "Bind Coverage" : currentStepId === "contact" && flow === "tenant" ? "Bind Coverage" : "Continue"} <ArrowRight className="h-4 w-4" />
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
