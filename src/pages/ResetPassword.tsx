import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import cedarLogo from "@/assets/cedar-logo.png";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      navigate("/auth");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <img src={cedarLogo} alt="Cedar Insurance" className="h-10 mx-auto mb-6" />
          <div className="bg-card border-2 border-border rounded-2xl p-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Password updated</h2>
            <p className="text-sm text-muted-foreground mb-6">You can now sign in with your new password.</p>
            <button onClick={() => navigate("/auth")}
              className="bg-accent text-white px-6 py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors">
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/"><img src={cedarLogo} alt="Cedar Insurance" className="h-10 mx-auto mb-4" /></a>
          <h1 className="text-2xl font-extrabold text-foreground font-serif">Set new password</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your new password below</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl p-4 mb-4">{error}</div>
        )}

        <div className="bg-card border-2 border-border rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">New password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-accent transition-colors" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-accent text-white py-3.5 rounded-xl font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50">
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
