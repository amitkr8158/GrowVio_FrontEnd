import { useState } from "react";
import { useSearchParams, useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, Tag, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { paymentService, openRazorpayModal, pollSagaStatus } from "@/services/paymentService";

const PLAN_DETAILS: Record<string, { name: string; monthly: number; annual: number; features: string[] }> = {
  PREMIUM: {
    name: "GrowVio Premium",
    monthly: 299,
    annual: 2499,
    features: ["All 7 knowledge levels", "Unlimited books", "Videos + audio summaries", "Full gamification + XP"],
  },
  PREMIUM_ANNUAL: {
    name: "GrowVio Premium (Annual)",
    monthly: 0,
    annual: 2499,
    features: ["All 7 knowledge levels", "Unlimited books", "Videos + audio summaries", "Full gamification + XP"],
  },
  PRO: {
    name: "GrowVio Pro",
    monthly: 599,
    annual: 4999,
    features: ["Everything in Premium", "Upload your own PDFs", "Private personal library", "2x XP multiplier"],
  },
  PRO_ANNUAL: {
    name: "GrowVio Pro (Annual)",
    monthly: 0,
    annual: 4999,
    features: ["Everything in Premium", "Upload your own PDFs", "Private personal library", "2x XP multiplier"],
  },
};

type PaymentStep = "idle" | "creating" | "razorpay" | "verifying" | "polling" | "done";

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const planId = (location.state as { plan?: string })?.plan || searchParams.get("plan") || "PREMIUM";
  const plan = PLAN_DETAILS[planId] || PLAN_DETAILS.PREMIUM;
  const isAnnual = planId.includes("ANNUAL");
  const price = isAnnual ? plan.annual : plan.monthly;

  const [couponCode, setCouponCode] = useState("");
  const [step, setStep] = useState<PaymentStep>("idle");
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setError(null);
    setStep("creating");

    try {
      // Step 1: Create Razorpay order on backend
      const orderData = await paymentService.createOrder(planId, couponCode || undefined);

      // Step 2: Open Razorpay modal
      setStep("razorpay");
      const razorpayResponse = await openRazorpayModal(orderData, {
        name: user?.name,
        email: user?.email,
      });

      // Step 3: Verify payment on backend
      setStep("verifying");
      const verifyResult = await paymentService.verifyPayment({
            ...razorpayResponse,
            plan: planId,
          });
      const sagaId = verifyResult.sagaId;

      if (!sagaId) {
        toast.success("Payment verified!");
        setStep("done");
        navigate("/payment/success", { state: { plan: planId } });
        return;
      }

      // Step 4: Poll saga status
      setStep("polling");
      await pollSagaStatus(sagaId);

      setStep("done");
      toast.success("Payment successful!");
      navigate("/payment/success", { state: { plan: planId } });
    } catch (err) {
      setStep("idle");
      const message = (err instanceof Error ? err.message : null) || "Payment failed. Please try again.";
      setError(message);
      toast.error(message);
    }
  };

  const isProcessing = step !== "idle";

  const stepMessage: Record<PaymentStep, string> = {
    idle: "",
    creating: "Creating order...",
    razorpay: "Complete payment in Razorpay...",
    verifying: "Verifying payment...",
    polling: "Activating your plan...",
    done: "Redirecting...",
  };

  return (
    <div className="min-h-screen bg-surface-2 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link to="/plans" className="inline-flex items-center gap-1 text-sm text-ink-3 hover:text-primary mb-6">
          <ChevronLeft className="h-4 w-4" />Back to plans
        </Link>

        <h1 className="font-display text-2xl font-bold text-ink-1 mb-6">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left — Order summary */}
          <div>
            <div className="bg-background border border-border rounded-xl p-6 mb-4">
              <h3 className="font-semibold text-ink-1 mb-4">Order Summary</h3>
              <div className="flex justify-between text-sm text-ink-2 mb-2">
                <span>{plan.name}</span>
                <span className="font-semibold text-ink-1">{"\u20B9"}{price}</span>
              </div>
              <div className="flex justify-between text-sm text-ink-2 mb-2">
                <span>Billing</span>
                <span>{isAnnual ? "Annual" : "Monthly"}</span>
              </div>
              {couponCode && (
                <div className="flex justify-between text-sm text-success mb-2">
                  <span>Coupon: {couponCode}</span>
                  <span>Applied at checkout</span>
                </div>
              )}
              <div className="border-t border-border my-3" />
              <div className="flex justify-between font-semibold text-ink-1">
                <span>Total</span>
                <span>{"\u20B9"}{price}{isAnnual ? "/year" : "/month"}</span>
              </div>
              {isAnnual && plan.monthly > 0 && (
                <p className="text-xs text-success mt-2">
                  You save {"\u20B9"}{plan.monthly * 12 - plan.annual}/year vs monthly
                </p>
              )}
            </div>

            {/* Coupon */}
            <div className="bg-background border border-border rounded-xl p-6">
              <h3 className="font-semibold text-ink-1 mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4" />Coupon Code
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={isProcessing}
                />
                <Button
                  variant="outline"
                  onClick={() => couponCode ? toast.info("Coupon will be applied at payment") : null}
                  disabled={!couponCode || isProcessing}
                >
                  Apply
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="mt-4 bg-primary-light/50 border border-primary/10 rounded-xl p-4">
              <p className="text-sm font-semibold text-primary mb-2">You'll unlock:</p>
              {plan.features.map((f) => (
                <p key={f} className="text-sm text-ink-2 flex items-center gap-2 py-0.5">
                  <span className="text-success">{"\u2713"}</span>{f}
                </p>
              ))}
            </div>
          </div>

          {/* Right — Pay */}
          <div>
            <div className="bg-background border border-border rounded-xl p-6">
              <h3 className="font-semibold text-ink-1 mb-4">Payment</h3>
              <p className="text-sm text-ink-3 mb-6">
                You'll be redirected to Razorpay's secure checkout. Pay via UPI, cards, net banking, or wallets.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              {isProcessing && step !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm flex items-center gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {stepMessage[step]}
                </motion.div>
              )}

              <Button
                className="w-full h-12 text-base shadow-glow mb-3"
                onClick={handlePay}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />{stepMessage[step]}</>
                ) : (
                  <>Pay {"\u20B9"}{price} {"\u2192"}</>
                )}
              </Button>

              <div className="flex items-center justify-center gap-4 text-xs text-ink-3">
                <span className="flex items-center gap-1"><Shield className="h-3 w-3" />256-bit SSL</span>
                <span className="flex items-center gap-1"><Lock className="h-3 w-3" />PCI Compliant</span>
                <span>Cancel anytime</span>
              </div>
            </div>

            {/* Payment info for logged-in user */}
            {user && (
              <div className="mt-4 bg-surface-2 rounded-xl p-4 text-sm text-ink-3">
                <p>Paying as: <span className="text-ink-1 font-medium">{user.email}</span></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
