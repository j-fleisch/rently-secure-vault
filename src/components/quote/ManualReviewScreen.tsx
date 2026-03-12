import { AlertTriangle, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UnderwritingDecision } from "./PriorInsuranceQuestions";

interface Props {
  decision: UnderwritingDecision;
  email: string;
  onBack: () => void;
}

export default function ManualReviewScreen({ decision, email, onBack }: Props) {
  return (
    <div className="space-y-8 text-center py-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mx-auto">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>

      <div>
        <h2 className="text-2xl md:text-3xl mb-2">Manual Review Required</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Based on the information provided, your application requires review by one of our underwriters before we can issue a policy.
        </p>
      </div>

      <div className="bg-muted/50 rounded-xl p-6 max-w-md mx-auto text-left space-y-3">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Review Reasons</h3>
        <ul className="space-y-2">
          {decision.reasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              {reason}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 max-w-md mx-auto text-left space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">What Happens Next?</h3>
        </div>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• An underwriter will review your application within 1–2 business days</li>
          <li>• You'll receive an email{email ? ` at ${email}` : ""} with the outcome</li>
          <li>• If approved, you can bind your policy instantly</li>
          <li>• If additional info is needed, we'll reach out directly</li>
        </ul>
      </div>

      <Button variant="outline" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Return Home
      </Button>
    </div>
  );
}
