import { CheckCircle } from "lucide-react";

interface Step {
  id: string;
  label: string;
}

interface QuoteProgressBarProps {
  steps: Step[];
  currentStep: number;
}

const QuoteProgressBar = ({ steps, currentStep }: QuoteProgressBarProps) => (
  <div className="mb-10">
    <div className="flex items-center justify-between mb-3">
      {steps.map((step, i) => (
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
          {i < steps.length - 1 && (
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
);

export default QuoteProgressBar;
