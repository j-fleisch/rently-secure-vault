// ═══ CEDAR RATING ENGINE ═══
// Single source of truth for all premium calculations, factor tables, and dropdown options.

// ── Dropdown Option Arrays ──

export const PROPERTY_TYPE_OPTIONS = [
  "Detached", "Semi-Detached", "Townhouse / Row", "Multi-Unit Residential",
  "Condo", "Duplex", "Triplex",
] as const;

export const CONSTRUCTION_OPTIONS = [
  "Brick", "Brick Veneer", "Frame with Vinyl Siding", "Frame with Aluminum Siding",
  "Concrete Block", "Stone", "Stucco", "Other",
] as const;

export const HEATING_OPTIONS = [
  "Forced Air Gas", "Forced Air Electric", "Baseboard Electric",
  "Hot Water Radiator", "Radiant In-Floor", "Heat Pump", "Other",
] as const;

export const ROOF_OPTIONS = [
  "Asphalt Shingle", "Metal", "Flat (Modified Bitumen)", "Flat (EPDM/TPO)",
  "Cedar Shake", "Slate", "Tile", "Other",
] as const;

export const BASEMENT_OPTIONS = [
  "Full, Finished", "Full, Unfinished", "Full, Partially Finished",
  "Partial, Finished", "Partial, Unfinished", "Crawl Space", "None",
] as const;

export const UNIT_TYPE_OPTIONS = [
  { value: "apartment", label: "Apartment" },
  { value: "condo", label: "Condo" },
  { value: "basement", label: "Basement Unit" },
  { value: "house", label: "House Rental" },
  { value: "townhouse", label: "Townhouse" },
  { value: "room", label: "Room / Shared" },
] as const;

export const LANDLORD_PROPERTY_TYPES = [
  { value: "detached", label: "Detached" },
  { value: "semi", label: "Semi-Detached" },
  { value: "townhouse", label: "Townhouse / Row" },
  { value: "multi", label: "Multi-Unit (2-6)" },
  { value: "condo", label: "Condo Unit" },
  { value: "duplex", label: "Duplex" },
] as const;

// ── Factor Tables ──

const UNIT_MULTIPLIERS: Record<number, number> = { 1: 1, 2: 1.35, 3: 1.6, 4: 1.85 };
const DEFAULT_UNIT_MULTIPLIER = 2.1;

const PROPERTY_TYPE_FACTORS: Record<string, number> = {
  "Detached": 1.0, "detached": 1.0,
  "Semi-Detached": 0.97, "semi": 0.97,
  "Townhouse / Row": 0.95, "townhouse": 0.95,
  "Multi-Unit Residential": 1.1, "multi": 1.1,
  "Condo": 0.75, "condo": 0.75,
  "Duplex": 1.05, "duplex": 1.05,
  "Triplex": 1.12,
};

const CONSTRUCTION_FACTORS: Record<string, number> = {
  "Brick": 0.95, "Brick Veneer": 0.97,
  "Frame with Vinyl Siding": 1.05, "Frame with Aluminum Siding": 1.03,
  "Concrete Block": 0.92, "Stone": 0.90, "Stucco": 1.0, "Other": 1.05,
};

const HEATING_FACTORS: Record<string, number> = {
  "Forced Air Gas": 1.0, "Forced Air Electric": 1.03,
  "Baseboard Electric": 1.08, "Hot Water Radiator": 1.02,
  "Radiant In-Floor": 1.0, "Heat Pump": 0.98, "Other": 1.05,
};

const ROOF_FACTORS: Record<string, number> = {
  "Asphalt Shingle": 1.0, "Metal": 0.95,
  "Flat (Modified Bitumen)": 1.08, "Flat (EPDM/TPO)": 1.06,
  "Cedar Shake": 1.15, "Slate": 0.92, "Tile": 0.94, "Other": 1.05,
};

const TENANT_UNIT_FACTORS: Record<string, number> = {
  apartment: 1.0, condo: 0.95, basement: 1.15, house: 1.05, townhouse: 1.0, room: 0.85,
};

const LIABILITY_ADDERS: Record<string, number> = {
  "1000000": 0, "2000000": 35, "3000000": 65,
};

// ── Landlord Inputs & Output ──

export interface LandlordQuoteInput {
  propertyType: string;
  yearBuilt: number;
  sqft: number;
  units: number;
  constructionType: string;
  heatingType: string;
  roofType: string;
  replacementCost: number;
  monthlyRentalIncome: number;
  isVacant: boolean;
  claimsHistory: number;
  shortTermRental: boolean;
}

export interface TierResult {
  annual: number;
  monthly: number;
}

export interface RatingBreakdown {
  tiers: {
    basic: TierResult;
    standard: TierResult;
    premium: TierResult;
  };
  rentalIncomeLimits: {
    basic: number;
    standard: number;
    premium: number;
  };
  // Factor breakdown for transparency component
  baseRate: number;
  basePremium: number;
  ageFactor: number;
  unitFactor: number;
  constructionFactor: number;
  heatingFactor: number;
  roofFactor: number;
  vacancyFactor: number;
  claimsFactor: number;
  strFactor: number;
  sizeFactor: number;
  calculatedPremium: number;
}

export function rateLandlordQuote(input: LandlordQuoteInput): RatingBreakdown {
  const rc = input.replacementCost || 400000;
  const baseRate = 3.50; // per $1,000 of RC
  const basePremium = rc * 0.0035;
  let base = basePremium;

  // Track individual factors
  const unitFactor = UNIT_MULTIPLIERS[Math.min(input.units || 1, 4)] || DEFAULT_UNIT_MULTIPLIER;
  base *= unitFactor;

  const propertyFactor = PROPERTY_TYPE_FACTORS[input.propertyType] || 1.0;
  base *= propertyFactor;

  const constructionFactor = CONSTRUCTION_FACTORS[input.constructionType] || 1.0;
  base *= constructionFactor;

  const heatingFactor = HEATING_FACTORS[input.heatingType] || 1.0;
  base *= heatingFactor;

  const roofFactor = ROOF_FACTORS[input.roofType] || 1.0;
  base *= roofFactor;

  // Age surcharge
  const age = 2026 - (input.yearBuilt || 1990);
  let ageFactor = 1.0;
  if (age > 50) ageFactor = 1.25;
  else if (age > 30) ageFactor = 1.12;
  else if (age < 5) ageFactor = 0.92;
  base *= ageFactor;

  // Claims surcharge
  const claimsFactor = (input.claimsHistory || 0) > 0 ? 1 + input.claimsHistory * 0.15 : 1.0;
  base *= claimsFactor;

  // Vacancy surcharge
  const vacancyFactor = input.isVacant ? 1.35 : 1.0;
  base *= vacancyFactor;

  // Short-term rental surcharge
  const strFactor = input.shortTermRental ? 1.2 : 1.0;
  base *= strFactor;

  // Size factor (optional)
  let sizeFactor = 1.0;
  const sqft = input.sqft || 1200;
  if (sqft > 3000) sizeFactor = 1.08;
  else if (sqft > 2000) sizeFactor = 1.04;
  else if (sqft < 800) sizeFactor = 0.95;
  base *= sizeFactor;

  const calculatedPremium = Math.round(base);
  const basicAnnual = calculatedPremium;
  const standardAnnual = Math.round(base * 1.25);
  const premiumAnnual = Math.round(base * 1.55);

  // Rental income loss limits (months of coverage × monthly rental income)
  const mri = input.monthlyRentalIncome || 0;

  return {
    tiers: {
      basic:    { annual: basicAnnual,    monthly: Math.round(basicAnnual / 12) },
      standard: { annual: standardAnnual, monthly: Math.round(standardAnnual / 12) },
      premium:  { annual: premiumAnnual,  monthly: Math.round(premiumAnnual / 12) },
    },
    rentalIncomeLimits: {
      basic:    mri * 12,
      standard: mri * 18,
      premium:  mri * 24,
    },
    // Factor breakdown
    baseRate,
    basePremium: Math.round(basePremium),
    ageFactor,
    unitFactor,
    constructionFactor,
    heatingFactor,
    roofFactor,
    vacancyFactor,
    claimsFactor,
    strFactor,
    sizeFactor,
    calculatedPremium,
  };
}

// ── Tier Display Details ──

export interface TierDetail {
  name: string;
  key: "basic" | "standard" | "premium";
  recommended: boolean;
  features: string[];
  liabilityLabel: string;
  lossOfRentMonths: number;
}

export const TIER_DETAILS: Record<"basic" | "standard" | "premium", TierDetail> = {
  basic: {
    name: "Basic",
    key: "basic",
    recommended: false,
    liabilityLabel: "$1,000,000",
    lossOfRentMonths: 12,
    features: [
      "Liability: $1,000,000|recommended",
      "Named perils",
    ],
  },
  standard: {
    name: "Standard",
    key: "standard",
    recommended: true,
    liabilityLabel: "$2,000,000",
    lossOfRentMonths: 18,
    features: [
      "Liability: $2,000,000|recommended",
      "Broad form",
      "Sewer backup: $50K",
      "Equipment breakdown",
    ],
  },
  premium: {
    name: "Premium",
    key: "premium",
    recommended: false,
    liabilityLabel: "$5,000,000",
    lossOfRentMonths: 24,
    features: [
      "Liability: $5,000,000|recommended",
      "All-risk coverage",
      "Sewer backup: $100K",
      "Equipment breakdown",
      "Identity theft",
      "Guaranteed replacement cost",
    ],
  },
};

/** Build the full features array for a tier, including dwelling and loss-of-rent lines. */
export function buildTierFeatures(
  tierKey: "basic" | "standard" | "premium",
  replacementCost: number,
  rentalIncomeLimits: { basic: number; standard: number; premium: number },
): string[] {
  const tier = TIER_DETAILS[tierKey];
  const rc = replacementCost || 400000;
  const lossOfRent = rentalIncomeLimits[tierKey];
  return [
    `Dwelling: $${rc.toLocaleString()}`,
    ...(lossOfRent > 0
      ? [`Loss of rent: $${lossOfRent.toLocaleString()} (${tier.lossOfRentMonths} mo)`]
      : [`Loss of rent: ${tier.lossOfRentMonths} months`]),
    ...tier.features,
  ];
}

// ── Tenant Inputs & Output ──

export interface TenantQuoteInput {
  unitType: string;
  contentsValue: number;
  liabilityLimit: string;
  deductible: number;
  hasHighValueItems: boolean;
}

export interface TenantRating {
  annual: number;
  monthly: number;
  low: number;
  high: number;
}

export function rateTenantQuote(input: TenantQuoteInput): TenantRating {
  let base = (input.contentsValue || 30000) * 0.012;

  // Unit type factor
  base *= TENANT_UNIT_FACTORS[input.unitType] || 1.0;

  // Liability adder
  base += LIABILITY_ADDERS[input.liabilityLimit] || 0;

  // High-value items
  if (input.hasHighValueItems) base *= 1.15;

  // Floor
  base = Math.max(base, 180);

  const annual = Math.round(base);
  return {
    annual,
    monthly: Math.round(annual / 12),
    low: Math.round(annual * 0.85),
    high: Math.round(annual * 1.15),
  };
}
