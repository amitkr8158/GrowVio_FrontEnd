import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/home";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login({ email, password });
      login(res.data);
      navigate(from, { replace: true });
    } catch (err) {
      const e = err as { code?: string; message?: string; response?: { data?: { message?: string } } };
      if (e?.code === "ECONNABORTED") {
        setError("Login is taking longer than usual. Server may be waking up, please try again in a few seconds.");
      } else if (e?.message?.toLowerCase?.().includes("canceled")) {
        setError("Request was canceled before completion. Please try login again.");
      } else {
        setError(e.response?.data?.message || "Invalid email or password");
      }
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
        <h2 className="font-display text-3xl font-bold text-white text-center mt-8 mb-4">Welcome back</h2>
        <p className="text-white/70 text-center max-w-sm">Continue your reading journey where you left off.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">GrowVio</span>
          </Link>

          <h1 className="font-display text-2xl font-bold text-ink-1 mb-2">Welcome back</h1>
          <p className="text-ink-3 mb-8">Sign in to continue learning</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-3" />
                <Input type="email" placeholder="amit@example.com" className="pl-9 h-11" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-3" />
                <Input type={showPassword ? "text" : "password"} placeholder="Your password" className="pl-9 pr-10 h-11" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <label htmlFor="remember" className="text-sm text-ink-3">Remember me for 30 days</label>
            </div>

            <Button className="w-full h-12 text-base font-medium" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-ink-3 mt-6">
            New user? <Link to="/signup" className="text-primary font-medium hover:underline">Create free account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
