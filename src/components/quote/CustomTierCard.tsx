import { Slider } from "@/components/ui/slider";
import { Settings2 } from "lucide-react";

interface CustomTierCardProps {
  selected: boolean;
  onSelect: () => void;
  dwelling: number;
  deductible: number;
  liability: number;
  onDwellingChange: (v: number) => void;
  onDeductibleChange: (v: number) => void;
  onLiabilityChange: (v: number) => void;
  monthlyPrice: number;
  annualPrice: number;
}

const LIABILITY_STEPS = [1000000, 2000000, 3000000, 5000000];
const DEDUCTIBLE_STEPS = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000];

function formatCurrency(n: number) {
  return `$${n.toLocaleString()}`;
}

function snapToNearest(value: number, steps: number[]) {
  return steps.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
}

const SliderField = ({
  label,
  value,
  min,
  max,
  step,
  steps,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  steps?: number[];
  onChange: (v: number) => void;
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    const num = parseInt(raw) || 0;
    if (steps) {
      onChange(snapToNearest(num, steps));
    } else {
      onChange(Math.min(Math.max(num, min), max));
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    const num = parseInt(raw) || min;
    if (steps) {
      onChange(snapToNearest(num, steps));
    } else {
      onChange(Math.min(Math.max(num, min), max));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <input
          type="text"
          value={formatCurrency(value)}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className="text-right text-sm font-semibold text-foreground bg-transparent border-b border-border focus:border-accent focus:outline-none w-28 py-0.5"
        />
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => {
          if (steps) {
            onChange(snapToNearest(v, steps));
          } else {
            onChange(v);
          }
        }}
      />
      <div className="flex justify-between text-[10px] text-muted-foreground/50">
        <span>{formatCurrency(min)}</span>
        <span>{formatCurrency(max)}</span>
      </div>
    </div>
  );
};

const CustomTierCard = ({
  selected,
  onSelect,
  dwelling,
  deductible,
  liability,
  onDwellingChange,
  onDeductibleChange,
  onLiabilityChange,
  monthlyPrice,
  annualPrice,
}: CustomTierCardProps) => (
  <div
    onClick={onSelect}
    className={`relative rounded-2xl p-6 bg-card cursor-pointer transition-all border-2 ${
      selected
        ? "border-accent shadow-lg"
        : "border-dashed border-border hover:border-accent/30 hover:shadow-sm"
    }`}
  >
    <div className="flex items-center gap-2 mb-1">
      <Settings2 className="w-4 h-4 text-accent" />
      <h3 className="text-lg font-bold text-foreground">Custom</h3>
    </div>
    <p className="text-xs text-muted-foreground mb-4">Build your own coverage</p>

    {selected ? (
      <>
        <div className="my-4">
          <span className="text-3xl font-extrabold text-accent">
            ${Math.round(monthlyPrice).toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">/month</span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          ${annualPrice.toLocaleString()}/year
        </p>

        <div className="border-t border-border pt-4 space-y-5" onClick={(e) => e.stopPropagation()}>
          <SliderField
            label="Dwelling"
            value={dwelling}
            min={100000}
            max={2000000}
            step={10000}
            onChange={onDwellingChange}
          />
          <SliderField
            label="Deductible"
            value={deductible}
            min={500}
            max={5000}
            step={500}
            steps={DEDUCTIBLE_STEPS}
            onChange={onDeductibleChange}
          />
          <SliderField
            label="Liability"
            value={liability}
            min={1000000}
            max={5000000}
            step={500000}
            steps={LIABILITY_STEPS}
            onChange={onLiabilityChange}
          />
        </div>
      </>
    ) : (
      <div className="my-4 flex flex-col items-center justify-center py-6 text-center">
        <Settings2 className="w-8 h-8 text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">Click to customize your coverage</p>
      </div>
    )}

    <button
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      className={`w-full mt-4 py-3 rounded-xl font-semibold transition-all ${
        selected
          ? "bg-accent text-white"
          : "bg-transparent border-2 border-border text-foreground hover:border-accent/40"
      }`}
    >
      {selected ? "Selected ✓" : "Customize"}
    </button>
  </div>
);

export default CustomTierCard;
