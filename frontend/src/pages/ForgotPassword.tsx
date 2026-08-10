import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";

const ForgotPassword = () => {
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero flex-col items-center justify-center p-12">
        <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
          <div className="w-48 h-64 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <BookOpen className="h-20 w-20 text-white/60" />
          </div>
        </motion.div>
        <h2 className="text-3xl font-display font-bold text-white mt-8 text-center">
          Reset your password
        </h2>
        <p className="text-white/70 mt-3 text-center max-w-sm">
          We'll send a secure link to your inbox so you can get back to reading.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <Link to="/login" className="inline-flex items-center gap-1 text-sm text-ink-3 hover:text-ink-1 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <CheckCircle className="h-14 w-14 text-success mx-auto mb-4" />
              <h1 className="text-2xl font-display font-bold text-ink-1 mb-2">Check your inbox</h1>
              <p className="text-ink-3 mb-6">
                If <strong>{email}</strong> is registered, you'll receive a password reset link shortly.
              </p>
              <p className="text-sm text-ink-4">
                Didn't receive it?{" "}
                <button
                  className="text-primary hover:underline"
                  onClick={() => setSent(false)}
                >
                  Try again
                </button>
              </p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl font-display font-bold text-ink-1 mb-1">Forgot password?</h1>
              <p className="text-ink-3 text-sm mb-6">Enter your email and we'll send you a reset link.</p>

              {error && (
                <div className="bg-danger-light border border-danger/20 rounded-lg p-3 mb-4 text-sm text-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-4" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending…" : "Send reset link"}
                </Button>
              </form>

              <p className="text-center text-sm text-ink-3 mt-4">
                Remember your password?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
