import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLAN_INFO: Record<string, { title: string; features: string[] }> = {
  PREMIUM: {
    title: "GrowVio Premium",
    features: ["All 7 knowledge levels on every book", "Unlimited book access", "Video scripts + audio summaries", "Full gamification + XP rewards"],
  },
  PREMIUM_ANNUAL: {
    title: "GrowVio Premium (Annual)",
    features: ["All 7 knowledge levels on every book", "Unlimited book access", "Video scripts + audio summaries", "Full gamification + XP rewards"],
  },
  PRO: {
    title: "GrowVio Pro",
    features: ["Everything in Premium", "Upload your own PDFs", "Private personal library", "2x XP multiplier on everything"],
  },
  PRO_ANNUAL: {
    title: "GrowVio Pro (Annual)",
    features: ["Everything in Premium", "Upload your own PDFs", "Private personal library", "2x XP multiplier on everything"],
  },
};

// Confetti particle component
const Confetti = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
    {Array.from({ length: 24 }).map((_, i) => {
      const colors = ["#7C3AED", "#1D9E75", "#378ADD", "#D85A30", "#D4537E", "#F59E0B"];
      const color = colors[i % colors.length];
      const left = Math.random() * 100;
      const delay = Math.random() * 1.5;
      const size = 6 + Math.random() * 6;
      return (
        <motion.div
          key={i}
          initial={{ y: -20, x: `${left}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: 0, rotate: 360 + Math.random() * 360 }}
          transition={{ duration: 2.5 + Math.random(), delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            backgroundColor: color,
          }}
        />
      );
    })}
  </div>
);

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const planId = (location.state as { plan?: string })?.plan || "PREMIUM";
  const plan = PLAN_INFO[planId] || PLAN_INFO.PREMIUM;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">
      <Confetti />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="max-w-md text-center z-10"
      >
        {/* Success circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.3, stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <Check className="h-10 w-10 text-success" strokeWidth={3} />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-display text-3xl font-bold text-ink-1 mb-2"
        >
          Welcome to {plan.title}!
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-ink-3 mb-6"
        >
          Your payment was successful. Here's what you've unlocked:
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-primary-light rounded-xl p-5 mb-6 text-left space-y-3"
        >
          {plan.features.map((f, i) => (
            <motion.p
              key={f}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="text-sm text-ink-2 flex items-center gap-2"
            >
              <Check className="h-4 w-4 text-success flex-shrink-0" />{f}
            </motion.p>
          ))}
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="grid grid-cols-1 gap-3"
        >
          <Button className="h-12 shadow-glow" onClick={() => navigate("/home")}>
            Start Exploring {"\u2192"}
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />Share with friends
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
