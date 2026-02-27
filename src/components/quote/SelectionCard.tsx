import { CheckCircle } from "lucide-react";

interface SelectionCardProps {
  selected: boolean;
  onClick: () => void;
  label: string;
  description?: string;
  extra?: string;
}

const SelectionCard = ({ selected, onClick, label, description, extra }: SelectionCardProps) => (
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

export default SelectionCard;
