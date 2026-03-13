import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Types ──

export interface CoverageOverrides {
  dwelling: number;
  deductible: number;
  liability: number;
  lossOfRentMonths: number;
  sewerBackup: number;
  equipmentBreakdown: boolean;
  identityTheft: boolean;
  guaranteedReplacementCost: boolean;
  coverageForm: "named" | "broad" | "all-risk";
}

export const DEFAULT_OVERRIDES: Record<"basic" | "standard" | "premium", Omit<CoverageOverrides, "dwelling">> = {
  basic: {
    deductible: 2500,
    liability: 1000000,
    lossOfRentMonths: 12,
    sewerBackup: 0,
    equipmentBreakdown: false,
    identityTheft: false,
    guaranteedReplacementCost: false,
    coverageForm: "named",
  },
  standard: {
    deductible: 1000,
    liability: 2000000,
    lossOfRentMonths: 18,
    sewerBackup: 50000,
    equipmentBreakdown: true,
    identityTheft: false,
    guaranteedReplacementCost: false,
    coverageForm: "broad",
  },
  premium: {
    deductible: 500,
    liability: 5000000,
    lossOfRentMonths: 24,
    sewerBackup: 100000,
    equipmentBreakdown: true,
    identityTheft: true,
    guaranteedReplacementCost: true,
    coverageForm: "all-risk",
  },
};

// ── Pricing helpers ──

const SEWER_PRICES: Record<number, number> = { 0: 0, 25000: 30, 50000: 55, 100000: 95 };
const SEWER_STEPS = [0, 25000, 50000, 100000];
const DEDUCTIBLE_STEPS = [500, 1000, 2500, 5000];
const LIABILITY_STEPS = [1000000, 2000000, 3000000, 5000000];
const COVERAGE_FORM_FACTORS: Record<string, number> = { named: 1.0, broad: 1.05, "all-risk": 1.12 };
const RENT_MONTHS_STEPS = [6, 12, 18, 24, 36, 48, 60];

export function calculateOverrideAnnual(
  basePremium: number,
  replacementCost: number,
  overrides: CoverageOverrides,
): number {
  const dwellingRatio = overrides.dwelling / replacementCost;
  const deductibleFactor = overrides.deductible >= 5000 ? 0.80 : overrides.deductible >= 2500 ? 0.85 : overrides.deductible >= 1000 ? 0.92 : 1.0;
  const liabilityAdder = overrides.liability >= 5000000 ? 120 : overrides.liability >= 3000000 ? 65 : overrides.liability >= 2000000 ? 35 : 0;
  const coverageFormFactor = COVERAGE_FORM_FACTORS[overrides.coverageForm] || 1.0;
  const sewerAdder = SEWER_PRICES[overrides.sewerBackup] || 0;
  const rentMonthsFactor = overrides.lossOfRentMonths / 12; // base is 12 months
  const rentAdder = (rentMonthsFactor - 1) * 40; // $40 per extra 12-month block
  const equipAdder = overrides.equipmentBreakdown ? 40 : 0;
  const idTheftAdder = overrides.identityTheft ? 25 : 0;
  const grcAdder = overrides.guaranteedReplacementCost ? 60 : 0;

  return Math.round(
    basePremium * dwellingRatio * deductibleFactor * coverageFormFactor
    + liabilityAdder + sewerAdder + rentAdder + equipAdder + idTheftAdder + grcAdder
  );
}

// ── Helpers ──

function fmt(n: number) { return `$${n.toLocaleString()}`; }
function snapTo(value: number, steps: number[]) {
  return steps.reduce((prev, curr) => Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev);
}

// ── Slider Row ──

const SliderRow = ({
  label, value, min, max, step, steps, format: formatFn, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  steps?: number[]; format?: (n: number) => string; onChange: (v: number) => void;
}) => {
  const display = formatFn ? formatFn(value) : fmt(value);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm font-bold text-accent">{display}</span>
      </div>
      <Slider
        min={min} max={max} step={step} value={[value]}
        onValueChange={([v]) => onChange(steps ? snapTo(v, steps) : v)}
      />
      <div className="flex justify-between text-[10px] text-muted-foreground/50">
        <span>{formatFn ? formatFn(min) : fmt(min)}</span>
        <span>{formatFn ? formatFn(max) : fmt(max)}</span>
      </div>
    </div>
  );
};

// ── Toggle Row ──

const ToggleRow = ({ label, sublabel, checked, onChange }: {
  label: string; sublabel?: string; checked: boolean; onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

// ── Main Component ──

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tierLabel: string;
  isCustom: boolean;
  overrides: CoverageOverrides;
  onChange: (overrides: CoverageOverrides) => void;
  replacementCost: number;
  basePremium: number;
  monthlyRentalIncome: number;
}

const CoverageCustomizeDrawer = ({
  open, onOpenChange, tierLabel, isCustom, overrides, onChange,
  replacementCost, basePremium, monthlyRentalIncome,
}: Props) => {
  const update = <K extends keyof CoverageOverrides>(key: K, value: CoverageOverrides[K]) => {
    onChange({ ...overrides, [key]: value });
  };

  const annual = calculateOverrideAnnual(basePremium, replacementCost, overrides);
  const monthly = Math.round(annual / 12);
  const rentLimit = monthlyRentalIncome * overrides.lossOfRentMonths;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            Customize {tierLabel} Plan
          </SheetTitle>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-accent">${monthly.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">/month</span>
            <span className="text-xs text-muted-foreground ml-2">(${annual.toLocaleString()}/yr)</span>
          </div>
        </SheetHeader>

        <div className="py-6 space-y-8">
          {/* ── Core Coverage ── */}
          <section className="space-y-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Core Coverage</h4>
            <SliderRow
              label="Dwelling (Replacement Cost)"
              value={overrides.dwelling}
              min={100000} max={3000000} step={10000}
              onChange={(v) => update("dwelling", v)}
            />
            <SliderRow
              label="Deductible"
              value={overrides.deductible}
              min={500} max={5000} step={100}
              steps={DEDUCTIBLE_STEPS}
              onChange={(v) => update("deductible", v)}
            />
            <SliderRow
              label="Liability"
              value={overrides.liability}
              min={1000000} max={5000000} step={500000}
              steps={LIABILITY_STEPS}
              onChange={(v) => update("liability", v)}
            />
          </section>

          {/* ── Extended Coverage (all tiers can see, Custom gets full control) ── */}
          {isCustom && (
            <>
              <section className="space-y-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loss of Rent</h4>
                <SliderRow
                  label="Coverage Duration"
                  value={overrides.lossOfRentMonths}
                  min={6} max={60} step={6}
                  steps={RENT_MONTHS_STEPS}
                  format={(n) => `${n} months`}
                  onChange={(v) => update("lossOfRentMonths", v)}
                />
                {monthlyRentalIncome > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Coverage limit: {fmt(rentLimit)} ({overrides.lossOfRentMonths} × {fmt(monthlyRentalIncome)}/mo)
                  </p>
                )}
              </section>

              <section className="space-y-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Coverage Form</h4>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: "named" as const, label: "Named Perils", desc: "Covers specific listed risks" },
                    { value: "broad" as const, label: "Broad Form", desc: "Covers most common risks" },
                    { value: "all-risk" as const, label: "All-Risk", desc: "Covers everything unless excluded" },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update("coverageForm", opt.value)}
                      className={`rounded-xl border-2 p-3 text-left transition-all ${
                        overrides.coverageForm === opt.value
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/30"
                      }`}
                    >
                      <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Add-Ons</h4>
                <SliderRow
                  label="Sewer Backup"
                  value={overrides.sewerBackup}
                  min={0} max={100000} step={25000}
                  steps={SEWER_STEPS}
                  format={(n) => n === 0 ? "None" : fmt(n)}
                  onChange={(v) => update("sewerBackup", snapTo(v, SEWER_STEPS))}
                />
                <ToggleRow
                  label="Equipment Breakdown"
                  sublabel="+$40/year"
                  checked={overrides.equipmentBreakdown}
                  onChange={(v) => update("equipmentBreakdown", v)}
                />
                <ToggleRow
                  label="Identity Theft Protection"
                  sublabel="+$25/year"
                  checked={overrides.identityTheft}
                  onChange={(v) => update("identityTheft", v)}
                />
                <ToggleRow
                  label="Guaranteed Replacement Cost"
                  sublabel="+$60/year"
                  checked={overrides.guaranteedReplacementCost}
                  onChange={(v) => update("guaranteedReplacementCost", v)}
                />
              </section>
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-background border-t border-border pt-4 pb-6">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-accent hover:bg-accent/90 text-white py-6 text-base font-semibold rounded-xl"
          >
            Apply — ${monthly.toLocaleString()}/mo (${annual.toLocaleString()}/yr)
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CoverageCustomizeDrawer;
