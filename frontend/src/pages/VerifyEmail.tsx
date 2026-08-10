import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";

const VerifyEmail = () => {
  const [searchParams]              = useSearchParams();
  const token                       = searchParams.get("token") ?? "";
  const navigate                    = useNavigate();
  const { login }                   = useAuth();

  const [status, setStatus]         = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("No verification token found in the link.");
      return;
    }
    authService.verifyEmail(token)
      .then((res) => {
        login(res.data);
        setStatus("success");
      })
      .catch((err: unknown) => {
        setStatus("error");
        const e = err as { response?: { data?: { message?: string } } };
        setErrorMsg(e.response?.data?.message || "Invalid or expired verification link.");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm text-center">
        {status === "loading" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Loader2 className="h-14 w-14 text-primary mx-auto mb-4 animate-spin" />
            <h1 className="text-xl font-display font-bold text-ink-1">Verifying your email…</h1>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <CheckCircle className="h-14 w-14 text-success mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold text-ink-1 mb-2">Email verified!</h1>
            <p className="text-ink-3 mb-6">Your account is now active. Ready to start reading?</p>
            <Button className="w-full" onClick={() => navigate("/home")}>
              Go to my dashboard
            </Button>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <XCircle className="h-14 w-14 text-danger mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold text-ink-1 mb-2">Verification failed</h1>
            <p className="text-ink-3 mb-6">{errorMsg}</p>
            <div className="space-y-3">
              <Link to="/login">
                <Button variant="outline" className="w-full">Back to login</Button>
              </Link>
              <p className="text-xs text-ink-4">
                Need a new link? Log in and check your account settings.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
