// ═══ CEDAR PREMIUM CALCULATION ENGINE ═══

export interface PremiumInput {
  replacementCost: number;
  units: number;
  yearBuilt: number;
  heating: string;
  claimsHistory: number;
  isVacant: boolean;
  shortTermRental: boolean;
}

export interface PremiumTiers {
  basic: number;
  standard: number;
  premium: number;
}

/**
 * Calculates annual premium tiers based on property & coverage data.
 * This is a simplified rating engine for MVP demonstration.
 */
export function calcPremium(input: PremiumInput): PremiumTiers {
  let base = (input.replacementCost || 400000) * 0.0035;

  // Unit multiplier
  const unitMultipliers: Record<number, number> = { 1: 1, 2: 1.35, 3: 1.6, 4: 1.85 };
  base *= unitMultipliers[Math.min(input.units || 1, 4)] || 2.1;

  // Age surcharge
  const age = 2026 - (input.yearBuilt || 1990);
  if (age > 50) base *= 1.25;
  else if (age > 30) base *= 1.12;

  // Heating surcharge
  if (input.heating === "Baseboard Electric") base *= 1.08;

  // Claims surcharge
  if ((input.claimsHistory || 0) > 0) base *= 1 + input.claimsHistory * 0.15;

  // Vacancy surcharge
  if (input.isVacant) base *= 1.35;

  // Short-term rental surcharge
  if (input.shortTermRental) base *= 1.2;

  const annual = Math.round(base);
  return {
    basic: annual,
    standard: Math.round(annual * 1.25),
    premium: Math.round(annual * 1.55),
  };
}

export interface TierInfo {
  name: string;
  key: "basic" | "standard" | "premium";
  recommended: boolean;
  features: (replacementCost: number) => string[];
}

export const COVERAGE_TIERS: TierInfo[] = [
  {
    name: "Basic",
    key: "basic",
    recommended: false,
    features: (rc) => [
      `Dwelling: $${(rc || 400000).toLocaleString()}`,
      "Liability: $1,000,000",
      "Loss of rent: 12 months",
      "Named perils",
    ],
  },
  {
    name: "Standard",
    key: "standard",
    recommended: true,
    features: (rc) => [
      `Dwelling: $${(rc || 400000).toLocaleString()}`,
      "Liability: $2,000,000",
      "Loss of rent: 18 months",
      "Broad form",
      "Sewer backup: $50K",
      "Equipment breakdown",
    ],
  },
  {
    name: "Premium",
    key: "premium",
    recommended: false,
    features: (rc) => [
      `Dwelling: $${(rc || 400000).toLocaleString()}`,
      "Liability: $5,000,000",
      "Loss of rent: 24 months",
      "All-risk coverage",
      "Sewer backup: $100K",
      "Equipment breakdown",
      "Identity theft",
      "Guaranteed replacement cost",
    ],
  },
];
