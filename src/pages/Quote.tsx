import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle, Home, Shield, User, Phone, Building2, Calendar, Layers, Users, Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SelectionCard from "@/components/quote/SelectionCard";
import QuoteProgressBar from "@/components/quote/QuoteProgressBar";

// ── Owner types (shared first step) ──
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

// ── Landlord-specific data ──
const landlordPropertyTypes = [
  { value: "house", label: "House" },
  { value: "condo", label: "Condo / Apartment" },
  { value: "townhouse", label: "Townhouse" },
  { value: "multi-unit", label: "Multi-Unit (2-4)" },
  { value: "commercial", label: "Commercial / Mixed Use" },
];

const unitCountOptions = [
  { value: "1", label: "1 Unit", description: "Single rental unit" },
  { value: "2", label: "2 Units", description: "Duplex" },
  { value: "3", label: "3 Units", description: "Triplex" },
  { value: "4", label: "4 Units", description: "Fourplex" },
  { value: "5+", label: "5+ Units", description: "Larger multi-unit building" },
];

const constructionTypes = [
  { value: "wood-frame", label: "Wood Frame" },
  { value: "brick", label: "Brick / Masonry" },
  { value: "concrete", label: "Concrete / Steel" },
  { value: "mixed", label: "Mixed Construction" },
  { value: "unsure", label: "Not Sure" },
];

const yearBuiltOptions = [
  { value: "pre-1950", label: "Before 1950" },
  { value: "1950-1979", label: "1950 – 1979" },
  { value: "1980-1999", label: "1980 – 1999" },
  { value: "2000-2014", label: "2000 – 2014" },
  { value: "2015+", label: "2015 or newer" },
];

const buildingSizeOptions = [
  { value: "small", label: "Under 1,500 sq ft" },
  { value: "medium", label: "1,500 – 3,000 sq ft" },
  { value: "large", label: "3,000 – 5,000 sq ft" },
  { value: "xlarge", label: "Over 5,000 sq ft" },
];

const propertyOwnerOptions = [
  { value: "individual", label: "Individual", description: "I own it personally" },
  { value: "joint", label: "Joint Ownership", description: "Owned with a partner or spouse" },
  { value: "corporation", label: "Corporation / LLC", description: "Owned through a business entity" },
];

const policyNameOptions = [
  { value: "same", label: "Same as Owner", description: "Policy in my / our name" },
  { value: "corporation", label: "Corporation Name", description: "Policy under business entity" },
  { value: "other", label: "Other", description: "A different name on the policy" },
];

const landlordInsuredOptions = [
  { value: "yes", label: "Yes", description: "I currently have landlord insurance" },
  { value: "no", label: "No", description: "I don't have coverage right now" },
  { value: "unsure", label: "Not Sure", description: "I need help figuring it out" },
];

const landlordCoverageOptions = [
  { value: "basic", label: "Basic", description: "Liability + property damage", price: "From $25/mo" },
  { value: "standard", label: "Standard", description: "Basic + loss of rental income", price: "From $45/mo" },
  { value: "comprehensive", label: "Comprehensive", description: "Full coverage including floods & earthquakes", price: "From $75/mo" },
];

// ── Step definitions per flow ──
const TENANT_STEPS = [
  { id: "owner-type", label: "Type" },
  { id: "currently-insured", label: "Insured?" },
  { id: "discounts", label: "Discounts" },
  { id: "coverage", label: "Coverage" },
  { id: "contact", label: "Contact" },
];

const LANDLORD_STEPS = [
  { id: "owner-type", label: "Type" },
  { id: "property-type", label: "Property" },
  { id: "property-details", label: "Details" },
  { id: "units", label: "Units" },
  { id: "currently-insured", label: "Insured?" },
  { id: "coverage", label: "Coverage" },
  { id: "contact", label: "Contact" },
];

// ── Form data shape ──
interface FormData {
  address: string;
  ownerType: string;
  // Tenant fields
  discount: string;
  // Landlord fields
  propertyType: string;
  yearBuilt: string;
  constructionType: string;
  buildingSize: string;
  propertyOwner: string;
  policyName: string;
  unitCount: string;
  // Shared
  currentlyInsured: string;
  coverage: string;
  creditConsent: boolean;
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
  const [formData, setFormData] = useState<FormData>({
    address,
    ownerType: "",
    discount: "",
    propertyType: "",
    yearBuilt: "",
    constructionType: "",
    buildingSize: "",
    propertyOwner: "",
    policyName: "",
    unitCount: "",
    currentlyInsured: "",
    coverage: "",
    creditConsent: false,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const flow = formData.ownerType;
  const steps = flow === "tenant" ? TENANT_STEPS : flow === "landlord" ? LANDLORD_STEPS : [{ id: "owner-type", label: "Type" }];

  // Get the current step ID based on flow
  const currentStepId = steps[currentStep]?.id || "owner-type";

  const canProceed = (): boolean => {
    switch (currentStepId) {
      case "owner-type": return !!formData.ownerType;
      case "currently-insured": return !!formData.currentlyInsured;
      case "discounts": return !!formData.discount;
      case "coverage": return !!formData.coverage && formData.creditConsent;
      case "property-type": return !!formData.propertyType;
      case "property-details": return !!formData.yearBuilt && !!formData.constructionType && !!formData.buildingSize && !!formData.propertyOwner && !!formData.policyName;
      case "units": return !!formData.unitCount;
      case "contact": return !!formData.firstName && !!formData.email;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
  };
  const handleBack = () => {
    if (currentStep > 0) {
      // If going back from step 1 (after owner type), reset to owner selection
      if (currentStep === 1) {
        setCurrentStep(0);
        setFormData((prev) => ({ ...prev, ownerType: "" }));
      } else {
        setCurrentStep((s) => s - 1);
      }
    }
  };
  const handleSubmit = () => {
    alert("Thank you! We'll send your quote to " + formData.email);
    navigate("/");
  };

  const handleOwnerTypeSelect = (value: string) => {
    updateField("ownerType", value);
    if (value === "homeowner") return; // handled in render
    // Auto-advance after selection
    setTimeout(() => setCurrentStep(1), 300);
  };

  // ── Render step content ──
  const renderStep = () => {
    // Homeowner coming-soon screen
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
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="your@email.com"
              className="w-full h-12 px-4 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              variant="hero"
              className="w-full"
              disabled={!formData.email}
              onClick={() => {
                alert("Thanks! We'll notify " + formData.email + " when homeowner insurance launches.");
                navigate("/");
              }}
            >
              Notify Me
            </Button>
          </div>
          <button
            onClick={() => {
              updateField("ownerType", "");
              setCurrentStep(0);
            }}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            ← Go back
          </button>
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
                <SelectionCard
                  key={opt.value}
                  selected={formData.ownerType === opt.value}
                  onClick={() => handleOwnerTypeSelect(opt.value)}
                  label={opt.label}
                  description={opt.description}
                />
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
                <SelectionCard
                  key={opt.value}
                  selected={formData.currentlyInsured === opt.value}
                  onClick={() => updateField("currentlyInsured", opt.value)}
                  label={opt.label}
                  description={opt.description}
                />
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
                <SelectionCard
                  key={opt.value}
                  selected={formData.discount === opt.value}
                  onClick={() => updateField("discount", opt.value)}
                  label={opt.label}
                  description={opt.description}
                />
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
              {(flow === "tenant" ? tenantCoverageOptions : landlordCoverageOptions).map((opt) => (
                <SelectionCard
                  key={opt.value}
                  selected={formData.coverage === opt.value}
                  onClick={() => updateField("coverage", opt.value)}
                  label={opt.label}
                  description={opt.description}
                  extra={opt.price}
                />
              ))}
            </div>

            {/* Credit consent box */}
            <div className="rounded-xl border-2 border-border bg-card p-5 space-y-4">
              <h3 className="font-semibold text-foreground">You could save more on your insurance!</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                I allow Cedar Insurance to use the information I've provided to do a soft credit check now
                and during any policy update or renewal. I understand this <strong className="text-foreground">will not</strong> affect
                my credit score.{" "}
                <a href="#" className="text-accent underline hover:text-accent/80">
                  Click here to learn more about how we use your credit information.
                </a>
              </p>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.creditConsent}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, creditConsent: e.target.checked }))
                  }
                  className="h-5 w-5 rounded border-2 border-muted-foreground/30 accent-accent"
                />
                <span className="text-sm font-medium text-foreground">I agree</span>
              </label>
            </div>
          </div>
        );

      // ── Landlord steps ──
      case "property-type":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl mb-2">What type of property?</h2>
              <p className="text-muted-foreground">
                {address ? `For ${address}` : "Select your property type."}
              </p>
            </div>
            <div className="space-y-3">
              {landlordPropertyTypes.map((opt) => (
                <SelectionCard
                  key={opt.value}
                  selected={formData.propertyType === opt.value}
                  onClick={() => updateField("propertyType", opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </div>
        );

      case "property-details":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl mb-2">Tell us about the property</h2>
              <p className="text-muted-foreground">These details help us calculate accurate coverage.</p>
            </div>

            {/* Year Built */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" /> Year Built
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {yearBuiltOptions.map((opt) => (
                  <SelectionCard
                    key={opt.value}
                    selected={formData.yearBuilt === opt.value}
                    onClick={() => updateField("yearBuilt", opt.value)}
                    label={opt.label}
                  />
                ))}
              </div>
            </div>

            {/* Construction Type */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-accent" /> Construction Type
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {constructionTypes.map((opt) => (
                  <SelectionCard
                    key={opt.value}
                    selected={formData.constructionType === opt.value}
                    onClick={() => updateField("constructionType", opt.value)}
                    label={opt.label}
                  />
                ))}
              </div>
            </div>

            {/* Building Size */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent" /> Building Size
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {buildingSizeOptions.map((opt) => (
                  <SelectionCard
                    key={opt.value}
                    selected={formData.buildingSize === opt.value}
                    onClick={() => updateField("buildingSize", opt.value)}
                    label={opt.label}
                  />
                ))}
              </div>
            </div>

            {/* Property Owner */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" /> Who owns the property?
              </h3>
              <div className="space-y-2">
                {propertyOwnerOptions.map((opt) => (
                  <SelectionCard
                    key={opt.value}
                    selected={formData.propertyOwner === opt.value}
                    onClick={() => updateField("propertyOwner", opt.value)}
                    label={opt.label}
                    description={opt.description}
                  />
                ))}
              </div>
            </div>

            {/* Policy Name */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Tag className="w-4 h-4 text-accent" /> Whose name will be on the policy?
              </h3>
              <div className="space-y-2">
                {policyNameOptions.map((opt) => (
                  <SelectionCard
                    key={opt.value}
                    selected={formData.policyName === opt.value}
                    onClick={() => updateField("policyName", opt.value)}
                    label={opt.label}
                    description={opt.description}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case "units":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl mb-2">How many rental units?</h2>
              <p className="text-muted-foreground">Select the number of units at this property.</p>
            </div>
            <div className="space-y-3">
              {unitCountOptions.map((opt) => (
                <SelectionCard
                  key={opt.value}
                  selected={formData.unitCount === opt.value}
                  onClick={() => updateField("unitCount", opt.value)}
                  label={opt.label}
                  description={opt.description}
                />
              ))}
            </div>
          </div>
        );

      // ── Shared contact step ──
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
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  placeholder="Jane"
                  className="w-full h-12 px-4 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  placeholder="Smith"
                  className="w-full h-12 px-4 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full h-12 px-4 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">Phone (optional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="(416) 555-0123"
                  className="w-full h-12 px-4 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        );
    }
  };

  // Don't show progress/nav for homeowner coming-soon
  const isHomeowner = formData.ownerType === "homeowner";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container py-12 md:py-20">
          <div className="max-w-2xl mx-auto">
            {/* Progress bar */}
            {!isHomeowner && <QuoteProgressBar steps={steps} currentStep={currentStep} />}

            {/* Address badge */}
            {address && !isHomeowner && (
              <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2.5">
                <Home className="h-4 w-4 text-accent" />
                <span className="font-medium text-foreground">{address}</span>
              </div>
            )}

            {/* Step content */}
            <div className="animate-fade-in-up">{renderStep()}</div>

            {/* Navigation */}
            {!isHomeowner && (
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={currentStep === 0 ? () => navigate("/") : handleBack}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {currentStep === 0 ? "Home" : "Back"}
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button
                    variant="hero"
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="gap-2"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="hero"
                    onClick={handleSubmit}
                    disabled={!canProceed()}
                    className="gap-2"
                  >
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
