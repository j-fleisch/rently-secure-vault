// Cedar Insurance — "How we calculated your premium" transparency component

import { useState } from "react";
import type { RatingBreakdown, LandlordQuoteInput, TenantRatingBreakdown, TenantQuoteInput } from "../lib/ratingEngine";

// ═══ LANDLORD BREAKDOWN ═══

interface LandlordBreakdownProps {
  input: LandlordQuoteInput;
  rating: RatingBreakdown;
  selectedTier: "basic" | "standard" | "premium";
}

export function LandlordPremiumBreakdown({ input, rating, selectedTier }: LandlordBreakdownProps) {
  const [expanded, setExpanded] = useState(false);
  const tierLabel = selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1);
  const tierData = rating.tiers[selectedTier];

  // Build the waterfall steps
  const steps = [
    {
      label: "Replacement Cost",
      value: input.replacementCost,
      format: "currency",
      factor: null as number | null,
      result: null as number | null,
      note: "Estimated cost to rebuild your property",
      impact: null as string | null,
    },
    {
      label: "Base Rate",
      value: rating.baseRate,
      format: "rate",
      factor: null as number | null,
      result: rating.basePremium,
      note: `${input.propertyType} — $${rating.baseRate.toFixed(2)} per $1,000 of replacement cost`,
      impact: null as string | null,
    },
    {
      label: "Building Age",
      value: rating.ageFactor,
      format: "factor",
      factor: rating.ageFactor,
      result: Math.round(rating.basePremium * rating.ageFactor),
      note: `Built ${input.yearBuilt} (${new Date().getFullYear() - input.yearBuilt} years old)`,
      impact: rating.ageFactor > 1.0 ? "increase" : rating.ageFactor < 1.0 ? "decrease" : "neutral",
    },
    {
      label: "Number of Units",
      value: rating.unitFactor,
      format: "factor",
      factor: rating.unitFactor,
      result: Math.round(rating.basePremium * rating.ageFactor * rating.unitFactor),
      note: `${input.units} unit${input.units > 1 ? "s" : ""} — more units = more exposure`,
      impact: rating.unitFactor > 1.0 ? "increase" : "neutral",
    },
    {
      label: "Construction Type",
      value: rating.constructionFactor,
      format: "factor",
      factor: rating.constructionFactor,
      result: null as number | null,
      note: `${input.constructionType}`,
      impact: rating.constructionFactor > 1.0 ? "increase" : rating.constructionFactor < 1.0 ? "decrease" : "neutral",
    },
    {
      label: "Heating System",
      value: rating.heatingFactor,
      format: "factor",
      factor: rating.heatingFactor,
      result: null as number | null,
      note: `${input.heatingType}`,
      impact: rating.heatingFactor > 1.0 ? "increase" : rating.heatingFactor < 1.0 ? "decrease" : "neutral",
    },
    {
      label: "Roof Type",
      value: rating.roofFactor,
      format: "factor",
      factor: rating.roofFactor,
      result: null as number | null,
      note: `${input.roofType}`,
      impact: rating.roofFactor > 1.0 ? "increase" : rating.roofFactor < 1.0 ? "decrease" : "neutral",
    },
  ];

  // Only add these if they're non-neutral
  if (input.isVacant) {
    steps.push({
      label: "Vacancy",
      value: rating.vacancyFactor,
      format: "factor",
      factor: rating.vacancyFactor,
      result: null,
      note: "Property is currently vacant — higher risk",
      impact: "increase",
    });
  }

  if (input.claimsHistory > 0) {
    steps.push({
      label: "Claims History",
      value: rating.claimsFactor,
      format: "factor",
      factor: rating.claimsFactor,
      result: null,
      note: `${input.claimsHistory} claim${input.claimsHistory > 1 ? "s" : ""} in past 5 years`,
      impact: "increase",
    });
  }

  if (input.shortTermRental) {
    steps.push({
      label: "Short-Term Rental",
      value: rating.strFactor,
      format: "factor",
      factor: rating.strFactor,
      result: null,
      note: "Airbnb / VRBO use — higher occupant turnover risk",
      impact: "increase",
    });
  }

  if (rating.sizeFactor !== 1.0) {
    steps.push({
      label: "Property Size",
      value: rating.sizeFactor,
      format: "factor",
      factor: rating.sizeFactor,
      result: null,
      note: `${input.sqft.toLocaleString()} sq ft`,
      impact: rating.sizeFactor > 1.0 ? "increase" : "decrease",
    });
  }

  const impactIcon = (impact: string | null) => {
    if (impact === "increase") return <span className="text-amber-600 text-xs font-bold">↑</span>;
    if (impact === "decrease") return <span className="text-green-600 text-xs font-bold">↓</span>;
    return <span className="text-muted-foreground text-xs">—</span>;
  };

  const formatFactor = (factor: number) => {
    if (factor === 1.0) return <span className="text-muted-foreground">1.00×</span>;
    if (factor > 1.0) return <span className="text-amber-700 font-semibold">{factor.toFixed(2)}×</span>;
    return <span className="text-green-700 font-semibold">{factor.toFixed(2)}×</span>;
  };

  const formatPercent = (factor: number) => {
    if (factor === 1.0) return <span className="text-muted-foreground text-xs">no change</span>;
    const pct = ((factor - 1) * 100).toFixed(0);
    if (factor > 1.0) return <span className="text-amber-600 text-xs">+{pct}%</span>;
    return <span className="text-green-600 text-xs">{pct}%</span>;
  };

  return (
    <div className="mt-6">
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 bg-card border-2 border-border rounded-xl hover:border-accent/30 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">How we calculated your premium</p>
            <p className="text-xs text-muted-foreground">See the rating factors behind your {tierLabel} plan quote</p>
          </div>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className={`text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-2 bg-card border-2 border-border rounded-xl overflow-hidden">
          {/* Waterfall header */}
          <div className="px-5 py-3 border-b border-border bg-muted/20">
            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground">
              <div className="col-span-1"></div>
              <div className="col-span-4">Factor</div>
              <div className="col-span-2 text-center">Rating</div>
              <div className="col-span-2 text-center">Impact</div>
              <div className="col-span-3">Detail</div>
            </div>
          </div>

          {/* Steps */}
          <div className="divide-y divide-border">
            {/* Base calculation */}
            <div className="px-5 py-3">
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-1 flex justify-center">
                  <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">1</div>
                </div>
                <div className="col-span-4">
                  <p className="text-sm font-medium text-foreground">Base Premium</p>
                </div>
                <div className="col-span-2 text-center">
                  <p className="text-sm font-mono text-foreground">${rating.baseRate.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">per $1,000 RC</p>
                </div>
                <div className="col-span-2 text-center">
                  <p className="text-sm font-bold text-foreground">${Math.round(rating.basePremium).toLocaleString()}</p>
                </div>
                <div className="col-span-3">
                  <p className="text-xs text-muted-foreground">${input.replacementCost.toLocaleString()} ÷ 1,000 × {rating.baseRate.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Factor chain */}
            {steps.slice(2).map((step, i) => (
              <div key={i} className={`px-5 py-3 ${step.impact === "decrease" ? "bg-green-50/50 dark:bg-green-950/20" : step.impact === "increase" ? "bg-amber-50/30 dark:bg-amber-950/20" : ""}`}>
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-1 flex justify-center">
                    {impactIcon(step.impact)}
                  </div>
                  <div className="col-span-4">
                    <p className="text-sm font-medium text-foreground">{step.label}</p>
                  </div>
                  <div className="col-span-2 text-center">
                    {step.factor && formatFactor(step.factor)}
                  </div>
                  <div className="col-span-2 text-center">
                    {step.factor && formatPercent(step.factor)}
                  </div>
                  <div className="col-span-3">
                    <p className="text-xs text-muted-foreground">{step.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Combined factor */}
          <div className="px-5 py-3 border-t-2 border-border bg-muted/10">
            <div className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-1"></div>
              <div className="col-span-4">
                <p className="text-sm font-semibold text-foreground">Combined Factor</p>
              </div>
              <div className="col-span-2 text-center">
                <p className="text-sm font-bold text-foreground font-mono">
                  {(rating.calculatedPremium / rating.basePremium).toFixed(3)}×
                </p>
              </div>
              <div className="col-span-2 text-center">
                <p className="text-sm font-bold text-foreground">${rating.calculatedPremium.toLocaleString()}</p>
              </div>
              <div className="col-span-3">
                <p className="text-xs text-muted-foreground">All factors applied to base</p>
              </div>
            </div>
          </div>

          {/* Tier multiplier */}
          <div className="px-5 py-3 border-t border-border">
            <div className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-1 flex justify-center">
                <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">2</div>
              </div>
              <div className="col-span-4">
                <p className="text-sm font-medium text-foreground">{tierLabel} Tier Multiplier</p>
              </div>
              <div className="col-span-2 text-center">
                {formatFactor(selectedTier === "basic" ? 1.0 : selectedTier === "standard" ? 1.25 : 1.55)}
              </div>
              <div className="col-span-2 text-center">
                {formatPercent(selectedTier === "basic" ? 1.0 : selectedTier === "standard" ? 1.25 : 1.55)}
              </div>
              <div className="col-span-3">
                <p className="text-xs text-muted-foreground">
                  {selectedTier === "basic" ? "Named perils, $1M liability" :
                   selectedTier === "standard" ? "Broad form, $2M liability, sewer" :
                   "All-risk, $5M liability, guaranteed RC"}
                </p>
              </div>
            </div>
          </div>

          {/* Final premium */}
          <div className="px-5 py-4 bg-accent/10 border-t-2 border-accent/20">
            <div className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-1 flex justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-accent">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="col-span-4">
                <p className="text-sm font-bold text-accent">Your {tierLabel} Premium</p>
              </div>
              <div className="col-span-2"></div>
              <div className="col-span-2 text-center">
                <p className="text-lg font-extrabold text-accent">${tierData.monthly.toLocaleString()}/mo</p>
                <p className="text-xs text-accent/60">${tierData.annual.toLocaleString()}/yr</p>
              </div>
              <div className="col-span-3">
                <p className="text-xs text-accent/70">
                  ${rating.calculatedPremium.toLocaleString()} × {selectedTier === "basic" ? "1.00" : selectedTier === "standard" ? "1.25" : "1.55"}
                </p>
              </div>
            </div>
          </div>

          {/* Coverage summary */}
          <div className="px-5 py-4 border-t border-border">
            <p className="text-xs font-semibold text-foreground mb-3">Included in your {tierLabel} plan:</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {[
                { label: "Dwelling Coverage", value: `$${input.replacementCost.toLocaleString()}` },
                { label: "Liability", value: selectedTier === "basic" ? "$1,000,000" : selectedTier === "standard" ? "$2,000,000" : "$5,000,000" },
                { label: "Loss of Rental Income", value: `$${rating.rentalIncomeLimits[selectedTier].toLocaleString()} (${selectedTier === "basic" ? "12" : selectedTier === "standard" ? "18" : "24"} mo)` },
                { label: "Deductible", value: selectedTier === "premium" ? "$2,500" : "$1,000" },
                ...(selectedTier !== "basic" ? [{ label: "Sewer & Water Backup", value: selectedTier === "standard" ? "$50,000" : "$100,000" }] : []),
                ...(selectedTier !== "basic" ? [{ label: "Equipment Breakdown", value: "Included" }] : []),
                ...(selectedTier === "premium" ? [{ label: "Identity Theft", value: "$25,000" }] : []),
                ...(selectedTier === "premium" ? [{ label: "Guaranteed Replacement Cost", value: "Included" }] : []),
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Savings hints */}
          <div className="px-5 py-4 border-t border-border bg-muted/10">
            <p className="text-xs font-semibold text-foreground mb-2">Ways to lower your premium:</p>
            <div className="space-y-1.5">
              {rating.constructionFactor > 0.95 && (
                <div className="flex items-start gap-2">
                  <span className="text-green-600 text-xs mt-0.5">💡</span>
                  <p className="text-xs text-muted-foreground">
                    <strong>Construction:</strong> Brick or concrete block construction receives the lowest rates. Your {input.constructionType} rates at {rating.constructionFactor.toFixed(2)}×.
                  </p>
                </div>
              )}
              {rating.ageFactor > 1.0 && (
                <div className="flex items-start gap-2">
                  <span className="text-green-600 text-xs mt-0.5">💡</span>
                  <p className="text-xs text-muted-foreground">
                    <strong>Property upgrades:</strong> Documenting electrical, plumbing, or roof upgrades through your Maintenance Log can reduce your age-related factor at renewal.
                  </p>
                </div>
              )}
              {input.claimsHistory > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-green-600 text-xs mt-0.5">💡</span>
                  <p className="text-xs text-muted-foreground">
                    <strong>Claims-free discount:</strong> Claims drop off your rating after 5 years. Each claim-free year improves your renewal pricing.
                  </p>
                </div>
              )}
              {selectedTier === "premium" && (
                <div className="flex items-start gap-2">
                  <span className="text-green-600 text-xs mt-0.5">💡</span>
                  <p className="text-xs text-muted-foreground">
                    <strong>Tier comparison:</strong> The Standard plan at ${rating.tiers.standard.annual.toLocaleString()}/yr saves ${(tierData.annual - rating.tiers.standard.annual).toLocaleString()}/yr with slightly less coverage.
                  </p>
                </div>
              )}
              {selectedTier === "basic" && (
                <div className="flex items-start gap-2">
                  <span className="text-accent text-xs mt-0.5">⬆️</span>
                  <p className="text-xs text-muted-foreground">
                    <strong>Consider Standard:</strong> For ${(rating.tiers.standard.annual - tierData.annual).toLocaleString()}/yr more, you get broad form coverage, $2M liability, sewer backup, and equipment breakdown.
                  </p>
                </div>
              )}
              <div className="flex items-start gap-2">
                <span className="text-green-600 text-xs mt-0.5">💡</span>
                <p className="text-xs text-muted-foreground">
                  <strong>Multi-property:</strong> Insuring 3+ properties with Cedar may qualify you for a portfolio discount at renewal.
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="px-5 py-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground">
              This rating is based on the information provided and is subject to verification. Final premium may differ based on underwriting review, inspection results, or additional risk factors. All rates are subject to carrier approval. Cedar Insurance is a managing general agency — coverage is underwritten by A-rated Canadian carriers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══ TENANT BREAKDOWN ═══

interface TenantBreakdownProps {
  input: TenantQuoteInput;
  rating: TenantRatingBreakdown;
}

export function TenantPremiumBreakdown({ input, rating }: TenantBreakdownProps) {
  const [expanded, setExpanded] = useState(false);
  const unitLabel = input.unitType.charAt(0).toUpperCase() + input.unitType.slice(1);

  const formatFactor = (factor: number) => {
    if (factor === 1.0) return <span className="text-muted-foreground">1.00×</span>;
    if (factor > 1.0) return <span className="text-amber-700 font-semibold">{factor.toFixed(2)}×</span>;
    return <span className="text-green-700 font-semibold">{factor.toFixed(2)}×</span>;
  };

  const formatPercent = (factor: number) => {
    if (factor === 1.0) return <span className="text-muted-foreground text-xs">no change</span>;
    const pct = ((factor - 1) * 100).toFixed(0);
    if (factor > 1.0) return <span className="text-amber-600 text-xs">+{pct}%</span>;
    return <span className="text-green-600 text-xs">{pct}%</span>;
  };

  return (
    <div className="mt-6">
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 bg-card border-2 border-border rounded-xl hover:border-accent/30 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">How we calculated your premium</p>
            <p className="text-xs text-muted-foreground">See the rating factors behind your quote</p>
          </div>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className={`text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-2 bg-card border-2 border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {/* Base contents premium */}
            <div className="px-5 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">1</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Contents Coverage</p>
                    <p className="text-xs text-muted-foreground">${input.contentsValue.toLocaleString()} at ${rating.contentsRate.toFixed(2)} per $1,000</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-foreground">${Math.round(rating.basePremium).toLocaleString()}</p>
              </div>
            </div>

            {/* Unit type */}
            {rating.unitFactor !== 1.0 && (
              <div className={`px-5 py-3 ${rating.unitFactor < 1.0 ? "bg-green-50/50 dark:bg-green-950/20" : "bg-amber-50/30 dark:bg-amber-950/20"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span>{rating.unitFactor > 1.0 ? <span className="text-amber-600 text-xs font-bold">↑</span> : <span className="text-green-600 text-xs font-bold">↓</span>}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">Unit Type: {unitLabel}</p>
                      <p className="text-xs text-muted-foreground">Unit type risk adjustment</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {formatFactor(rating.unitFactor)}
                    <div>{formatPercent(rating.unitFactor)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Deductible */}
            {rating.deductibleFactor !== 1.0 && (
              <div className={`px-5 py-3 ${rating.deductibleFactor < 1.0 ? "bg-green-50/50 dark:bg-green-950/20" : "bg-amber-50/30 dark:bg-amber-950/20"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span>{rating.deductibleFactor < 1.0 ? <span className="text-green-600 text-xs font-bold">↓</span> : <span className="text-amber-600 text-xs font-bold">↑</span>}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">Deductible: ${input.deductible.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{rating.deductibleFactor < 1.0 ? "Higher deductible = lower premium" : "Lower deductible = higher premium"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {formatFactor(rating.deductibleFactor)}
                    <div>{formatPercent(rating.deductibleFactor)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Liability add-on */}
            {rating.liabilityAddon > 0 && (
              <div className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-xs">+</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">Enhanced Liability</p>
                      <p className="text-xs text-muted-foreground">${(parseInt(input.liabilityLimit) / 1000000)}M liability (upgrade from base $1M)</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-amber-700">+${rating.liabilityAddon}/yr</p>
                </div>
              </div>
            )}

            {/* High-value items */}
            {input.hasHighValueItems && (
              <div className="px-5 py-3 bg-amber-50/30 dark:bg-amber-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-amber-600 text-xs font-bold">↑</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">High-Value Items</p>
                      <p className="text-xs text-muted-foreground">15% surcharge for items over $2,500 individual value</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-700 font-semibold">1.15×</span>
                    <div><span className="text-amber-600 text-xs">+15%</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Final */}
          <div className="px-5 py-4 bg-accent/10 border-t-2 border-accent/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-accent">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p className="text-sm font-bold text-accent">Your Annual Premium</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold text-accent">${rating.monthly}/mo</p>
                <p className="text-xs text-accent/60">${rating.annual}/yr</p>
              </div>
            </div>
          </div>

          {/* Savings hints */}
          <div className="px-5 py-4 border-t border-border bg-muted/10">
            <p className="text-xs font-semibold text-foreground mb-2">Ways to adjust your premium:</p>
            <div className="space-y-1.5">
              {input.deductible < 1000 && (
                <div className="flex items-start gap-2">
                  <span className="text-green-600 text-xs mt-0.5">💡</span>
                  <p className="text-xs text-muted-foreground">
                    <strong>Raise your deductible:</strong> A $1,000 deductible saves ~10% vs. $500. You pay more per claim but less monthly.
                  </p>
                </div>
              )}
              {parseInt(input.liabilityLimit) > 1000000 && (
                <div className="flex items-start gap-2">
                  <span className="text-green-600 text-xs mt-0.5">💡</span>
                  <p className="text-xs text-muted-foreground">
                    <strong>Liability level:</strong> $1M liability is the minimum most landlords require. Your $2M+ costs ${rating.liabilityAddon}/yr extra.
                  </p>
                </div>
              )}
              <div className="flex items-start gap-2">
                <span className="text-green-600 text-xs mt-0.5">💡</span>
                <p className="text-xs text-muted-foreground">
                  <strong>Right-size your contents:</strong> Use the Contents Inventory in your portal to track exactly what you own — avoids over or underinsuring.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 text-xs mt-0.5">💡</span>
                <p className="text-xs text-muted-foreground">
                  <strong>Referral credit:</strong> Refer a friend and you both earn $50 off your next billing cycle.
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="px-5 py-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground">
              This rating is based on the information provided and is subject to verification. Final premium may differ based on underwriting review. All rates subject to carrier approval. Cedar Insurance is a managing general agency — coverage is underwritten by A-rated Canadian carriers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
