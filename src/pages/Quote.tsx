import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle, Home, Shield, User, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const STEPS = [
  { id: "owner-type", label: "Owner Type", icon: User },
  { id: "property-type", label: "Property", icon: Home },
  { id: "currently-insured", label: "Insured?", icon: Shield },
  { id: "coverage", label: "Coverage", icon: CheckCircle },
  { id: "contact", label: "Contact", icon: Phone },
];

const ownerTypes = [
  { value: "landlord", label: "Landlord", description: "I own rental property" },
  { value: "tenant", label: "Tenant", description: "I rent my home" },
  { value: "homeowner", label: "Homeowner", description: "I own and live in my home" },
];

const propertyTypes = [
  { value: "house", label: "House" },
  { value: "condo", label: "Condo / Apartment" },
  { value: "townhouse", label: "Townhouse" },
  { value: "multi-unit", label: "Multi-Unit (2-4)" },
  { value: "commercial", label: "Commercial / Mixed Use" },
];

const insuredOptions = [
  { value: "yes", label: "Yes", description: "I currently have property insurance" },
  { value: "no", label: "No", description: "I don't have coverage right now" },
  { value: "unsure", label: "Not Sure", description: "I need help figuring it out" },
];

const coverageOptions = [
  { value: "basic", label: "Basic", description: "Liability + property damage", price: "From $25/mo" },
  { value: "standard", label: "Standard", description: "Basic + loss of rental income", price: "From $45/mo" },
  { value: "comprehensive", label: "Comprehensive", description: "Full coverage including floods & earthquakes", price: "From $75/mo" },
];

const Quote = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const address = searchParams.get("address") || "";

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    address,
    ownerType: "",
    propertyType: "",
    currentlyInsured: "",
    coverage: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!formData.ownerType;
      case 1: return !!formData.propertyType;
      case 2: return !!formData.currentlyInsured;
      case 3: return !!formData.coverage;
      case 4: return !!formData.firstName && !!formData.email;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
  };
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };
  const handleSubmit = () => {
    // Future: submit to backend
    alert("Thank you! We'll send your quote to " + formData.email);
    navigate("/");
  };

  const SelectionCard = ({
    selected,
    onClick,
    label,
    description,
    extra,
  }: {
    selected: boolean;
    onClick: () => void;
    label: string;
    description?: string;
    extra?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
        selected
          ? "border-accent bg-accent/10 shadow-md"
          : "border-border bg-card hover:border-accent/40 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-foreground">{label}</p>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {extra && <span className="text-xs font-medium text-accent">{extra}</span>}
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              selected ? "border-accent bg-accent" : "border-muted-foreground/30"
            }`}
          >
            {selected && <CheckCircle className="w-3 h-3 text-white" />}
          </div>
        </div>
      </div>
    </button>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
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
                  onClick={() => updateField("ownerType", opt.value)}
                  label={opt.label}
                  description={opt.description}
                />
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl mb-2">What type of property?</h2>
              <p className="text-muted-foreground">
                {address ? `For ${address}` : "Select your property type."}
              </p>
            </div>
            <div className="space-y-3">
              {propertyTypes.map((opt) => (
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

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl mb-2">Is your property currently insured?</h2>
              <p className="text-muted-foreground">This helps us find the best rate for you.</p>
            </div>
            <div className="space-y-3">
              {insuredOptions.map((opt) => (
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

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl mb-2">Choose your coverage level</h2>
              <p className="text-muted-foreground">You can always adjust this later.</p>
            </div>
            <div className="space-y-3">
              {coverageOptions.map((opt) => (
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
          </div>
        );

      case 4:
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container py-12 md:py-20">
          <div className="max-w-2xl mx-auto">
            {/* Progress bar */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3">
                {STEPS.map((step, i) => (
                  <div key={step.id} className="flex items-center gap-1.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        i < currentStep
                          ? "bg-accent text-white"
                          : i === currentStep
                          ? "bg-accent text-white ring-2 ring-accent/30 ring-offset-2 ring-offset-background"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className="hidden sm:block text-xs font-medium text-muted-foreground">
                      {step.label}
                    </span>
                    {i < STEPS.length - 1 && (
                      <div
                        className={`hidden sm:block w-8 md:w-16 h-0.5 mx-1 transition-colors ${
                          i < currentStep ? "bg-accent" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Address badge */}
            {address && (
              <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2.5">
                <Home className="h-4 w-4 text-accent" />
                <span className="font-medium text-foreground">{address}</span>
              </div>
            )}

            {/* Step content */}
            <div className="animate-fade-in-up">{renderStep()}</div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={currentStep === 0 ? () => navigate("/") : handleBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {currentStep === 0 ? "Home" : "Back"}
              </Button>

              {currentStep < STEPS.length - 1 ? (
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
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Quote;
