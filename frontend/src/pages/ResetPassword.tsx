import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Eye, EyeOff, Lock, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";

const ResetPassword = () => {
  const [searchParams]              = useSearchParams();
  const token                       = searchParams.get("token") ?? "";
  const navigate                    = useNavigate();

  const [newPassword, setNewPassword]     = useState("");
  const [confirmPassword, setConfirm]     = useState("");
  const [showNew, setShowNew]             = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [loading, setLoading]             = useState(false);
  const [done, setDone]                   = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword(token, newPassword);
      setDone(true);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Invalid or expired reset link. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center max-w-sm">
          <p className="text-ink-1 font-medium mb-3">Invalid reset link.</p>
          <Link to="/forgot-password" className="text-primary hover:underline text-sm">
            Request a new one
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero flex-col items-center justify-center p-12">
        <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
          <div className="w-48 h-64 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <BookOpen className="h-20 w-20 text-white/60" />
          </div>
        </motion.div>
        <h2 className="text-3xl font-display font-bold text-white mt-8 text-center">
          Set a new password
        </h2>
        <p className="text-white/70 mt-3 text-center max-w-sm">
          Choose something strong and memorable.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <Link to="/login" className="inline-flex items-center gap-1 text-sm text-ink-3 hover:text-ink-1 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>

          {done ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <CheckCircle className="h-14 w-14 text-success mx-auto mb-4" />
              <h1 className="text-2xl font-display font-bold text-ink-1 mb-2">Password updated!</h1>
              <p className="text-ink-3 mb-6">Your password has been reset successfully.</p>
              <Button className="w-full" onClick={() => navigate("/login")}>
                Log in with new password
              </Button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl font-display font-bold text-ink-1 mb-1">Set new password</h1>
              <p className="text-ink-3 text-sm mb-6">Must be at least 8 characters.</p>

              {error && (
                <div className="bg-danger-light border border-danger/20 rounded-lg p-3 mb-4 text-sm text-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="new-password">New password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-4" />
                    <Input
                      id="new-password"
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-9 pr-9"
                      placeholder="Min. 8 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink-2"
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirm new password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-4" />
                    <Input
                      id="confirm-password"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="pl-9 pr-9"
                      placeholder="Repeat password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink-2"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Updating…" : "Update password"}
                </Button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
