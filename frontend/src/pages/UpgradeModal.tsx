import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Check, Crown, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppShell from "@/components/layout/AppShell";

const UpgradeModal = ({ level = 4, bookTitle = "Atomic Habits", onClose }: { level?: number; bookTitle?: string; onClose?: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-background rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
      <Lock className="h-10 w-10 text-primary mx-auto mb-3" />
      <h2 className="font-display text-xl font-bold text-ink-1 mb-2">Unlock Level {level} of {bookTitle}</h2>
      <ul className="text-sm text-ink-2 space-y-2 text-left my-4">
        <li className="flex gap-2"><Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />3,000 words of deep analysis</li>
        <li className="flex gap-2"><Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />Practical exercises & workbook</li>
        <li className="flex gap-2"><Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />Quiz with XP rewards</li>
      </ul>
      <div className="bg-primary-light rounded-xl p-4 mb-4">
        <p className="text-sm font-semibold text-primary">STARTER Plan</p>
        <p className="text-2xl font-display font-bold text-ink-1">₹99<span className="text-sm font-normal text-ink-3">/month</span></p>
      </div>
      <Button className="w-full h-12 shadow-glow" asChild><Link to="/plans">Unlock with STARTER →</Link></Button>
      <button onClick={onClose} className="text-sm text-ink-3 mt-3 hover:text-primary">Not now</button>
      <div className="flex justify-center gap-4 mt-4 text-[10px] text-ink-4">
        <span>Cancel anytime</span><span>·</span><span>Instant access</span><span>·</span><span>Secure payment</span>
      </div>
    </motion.div>
  </div>
);

export default UpgradeModal;
