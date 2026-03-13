import { CheckCircle, Settings2 } from "lucide-react";

interface TierCardProps {
  tier: string;
  price: number;
  features: string[];
  recommended?: boolean;
  selected: boolean;
  onSelect: () => void;
  onCustomize?: () => void;
}

const TierCard = ({ tier, price, features, recommended, selected, onSelect, onCustomize }: TierCardProps) => (
  <div
    onClick={onSelect}
    className={`relative rounded-2xl p-6 bg-card cursor-pointer transition-all border-2 ${
      selected
        ? "border-accent shadow-lg"
        : recommended
        ? "border-accent/50 hover:shadow-md"
        : "border-border hover:border-accent/30 hover:shadow-sm"
    }`}
  >
    {recommended && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
        Recommended
      </div>
    )}
    <h3 className="text-lg font-bold text-foreground">{tier}</h3>
    <div className="my-4">
      <span className="text-3xl font-extrabold text-accent">${Math.round(price / 12).toLocaleString()}</span>
      <span className="text-sm text-muted-foreground">/month</span>
    </div>
    <p className="text-xs text-muted-foreground mb-1">${price.toLocaleString()}/year</p>
    <div className="border-t border-border mt-4 pt-4 space-y-3">
      {features.map((f, i) => {
        const [text, hint] = f.split("|");
        return (
          <div key={i} className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent" />
            <span className="text-sm text-foreground">
              {text}
              {hint && <span className="text-xs text-muted-foreground ml-1">({hint})</span>}
            </span>
          </div>
        );
      })}
    </div>
    <div className="flex gap-2 mt-4">
      <button
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
          selected
            ? "bg-accent text-white"
            : "bg-transparent border-2 border-border text-foreground hover:border-accent/40"
        }`}
      >
        {selected ? "Selected ✓" : "Select Plan"}
      </button>
      {onCustomize && (
        <button
          onClick={(e) => { e.stopPropagation(); onCustomize(); }}
          className="px-3 py-3 rounded-xl border-2 border-border text-muted-foreground hover:border-accent/40 hover:text-accent transition-all"
          title="Customize this plan"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
);

export default TierCard;
