import { Info } from "lucide-react";
import SelectionCard from "@/components/quote/SelectionCard";

export interface PriorInsurance {
  hasCurrentInsurance: string; // "yes" | "no" | "unsure"
  currentInsurer: string;
  policyExpiry: string;
  cancelledOrNonRenewed: boolean;
  cancellationReason: string;
  lapseDuration: string;
  continuousYears: string;
}

export interface UnderwritingDecision {
  canBind: boolean;
  reasons: string[];
}

const COMMON_INSURERS = [
  "Aviva", "Intact", "Wawanesa", "Economical", "Co-operators",
  "TD Insurance", "Desjardins", "Gore Mutual", "Northbridge", "Other",
];

interface Props {
  prior: PriorInsurance;
  onChange: (updated: PriorInsurance) => void;
}

export function evaluateUnderwriting(
  input: { claimsHistory: number; shortTermRental: boolean },
  prior: PriorInsurance
): UnderwritingDecision {
  const reasons: string[] = [];

  if (prior.cancelledOrNonRenewed) {
    reasons.push("Previous policy was cancelled or non-renewed");
  }
  if (prior.lapseDuration === "more-than-60") {
    reasons.push("Coverage lapse exceeds 60 days");
  }
  if (input.claimsHistory >= 3) {
    reasons.push("3 or more claims in the past 5 years");
  }
  if (input.shortTermRental && prior.cancelledOrNonRenewed) {
    reasons.push("Short-term rental with prior cancellation history");
  }

  return { canBind: reasons.length === 0, reasons };
}

const inputClass =
  "w-full h-12 px-4 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
const selectClass =
  "w-full h-12 px-3 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer";

export default function PriorInsuranceQuestions({ prior, onChange }: Props) {
  const update = <K extends keyof PriorInsurance>(key: K, value: PriorInsurance[K]) =>
    onChange({ ...prior, [key]: value });

  return (
    <div className="space-y-5 border-t border-border pt-6 mt-6">
      <div className="flex items-start gap-2">
        <Info className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-base font-semibold text-foreground">Prior Insurance Details</h3>
          <p className="text-sm text-muted-foreground">
            Tell us about your current or most recent coverage so we can ensure a seamless transition.
          </p>
        </div>
      </div>

      {/* Current Insurer */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">
          Current Insurance Company
        </label>
        <select
          value={prior.currentInsurer}
          onChange={(e) => update("currentInsurer", e.target.value)}
          className={selectClass}
        >
          <option value="">Select your insurer</option>
          {COMMON_INSURERS.map((ins) => (
            <option key={ins} value={ins}>{ins}</option>
          ))}
        </select>
      </div>

      {/* Policy Expiry */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">
          Current Policy Expiry Date
        </label>
        <input
          type="date"
          value={prior.policyExpiry}
          onChange={(e) => update("policyExpiry", e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Continuous years */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">
          Years of Continuous Coverage
        </label>
        <select
          value={prior.continuousYears}
          onChange={(e) => update("continuousYears", e.target.value)}
          className={selectClass}
        >
          <option value="">Select</option>
          <option value="less-than-1">Less than 1 year</option>
          <option value="1-3">1–3 years</option>
          <option value="3-5">3–5 years</option>
          <option value="5-plus">5+ years</option>
        </select>
      </div>

      {/* Cancelled or Non-Renewed */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Has any insurer cancelled or non-renewed your coverage?
        </label>
        <div className="flex gap-3">
          <SelectionCard
            selected={prior.cancelledOrNonRenewed === false}
            onClick={() => update("cancelledOrNonRenewed", false)}
            label="No"
          />
          <SelectionCard
            selected={prior.cancelledOrNonRenewed === true}
            onClick={() => update("cancelledOrNonRenewed", true)}
            label="Yes"
          />
        </div>
      </div>

      {prior.cancelledOrNonRenewed && (
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">
            Reason for cancellation / non-renewal
          </label>
          <input
            type="text"
            value={prior.cancellationReason}
            onChange={(e) => update("cancellationReason", e.target.value)}
            placeholder="e.g. Non-payment, claims frequency, underwriting"
            className={inputClass}
          />
        </div>
      )}

      {/* Lapse in coverage */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">
          Any lapse in coverage?
        </label>
        <select
          value={prior.lapseDuration}
          onChange={(e) => update("lapseDuration", e.target.value)}
          className={selectClass}
        >
          <option value="">Select</option>
          <option value="none">No lapse</option>
          <option value="less-than-30">Less than 30 days</option>
          <option value="30-60">30–60 days</option>
          <option value="more-than-60">More than 60 days</option>
        </select>
      </div>
    </div>
  );
}
