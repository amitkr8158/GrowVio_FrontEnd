import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, X, Crown, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/context/AuthContext";

interface PlanConfig {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  monthlyMrp: number;
  annual: number;
  annualMrp: number;
  icon: typeof Crown | null;
  badge: string | null;
  color: string;
  whatYouGet: string;
  features: { text: string; included: boolean }[];
  cta: string;
}

const PLANS: PlanConfig[] = [
  {
    id: "FREE",
    name: "Free",
    tagline: "Start your journey",
    monthly: 0,
    monthlyMrp: 0,
    annual: 0,
    annualMrp: 0,
    icon: null,
    badge: null,
    color: "border-border",
    whatYouGet: "5 books · Level 1 & 2 only",
    features: [
      { text: "5 featured books", included: true },
      { text: "Level 1 & 2 only", included: true },
      { text: "Basic reading stats", included: true },
      { text: "Community access", included: true },
      { text: "All 7 textual levels", included: false },
      { text: "Audio / video summaries", included: false },
    ],
    cta: "Current Plan",
  },
  {
    id: "STARTER",
    name: "Starter",
    tagline: "Best value",
    monthly: 149,
    monthlyMrp: 299,
    annual: 1490,
    annualMrp: 2990,
    icon: Star,
    badge: "BEST VALUE",
    color: "border-primary shadow-glow ring-2 ring-primary",
    whatYouGet: "All books · All 7 textual levels",
    features: [
      { text: "All books unlocked", included: true },
      { text: "All 7 textual levels", included: true },
      { text: "Full gamification + XP rewards", included: true },
      { text: "Quizzes, workbooks, notes", included: true },
      { text: "Audio / video summaries", included: false },
      { text: "AI RAG on your books", included: false },
    ],
    cta: "Get Starter",
  },
  {
    id: "PREMIUM",
    name: "Premium",
    tagline: "Most popular",
    monthly: 299,
    monthlyMrp: 499,
    annual: 2990,
    annualMrp: 4990,
    icon: Crown,
    badge: "MOST POPULAR",
    color: "border-warning",
    whatYouGet: "All 7 textual + 3 audio/video levels",
    features: [
      { text: "Everything in Starter", included: true },
      { text: "Audio + video summaries (Hindi & English)", included: true },
      { text: "Priority support", included: true },
      { text: "Early access to new features", included: true },
      { text: "AI RAG on your books", included: false },
      { text: "Upload your own PDFs", included: false },
    ],
    cta: "Get Premium",
  },
  {
    id: "PRO",
    name: "Pro",
    tagline: "Power user",
    monthly: 799,
    monthlyMrp: 999,
    annual: 7990,
    annualMrp: 9990,
    icon: Zap,
    badge: "POWER USER",
    color: "border-danger",
    whatYouGet: "Everything + AI RAG on 5 books/month",
    features: [
      { text: "Everything in Premium", included: true },
      { text: "AI RAG on 5 books/month", included: true },
      { text: "Upload your own PDFs", included: true },
      { text: "Personal 7-level summaries", included: true },
      { text: "2× XP multiplier", included: true },
      { text: "Private library (your RAG engine)", included: true },
    ],
    cta: "Get Pro",
  },
];

const faqs = [
  { q: "Can I cancel anytime?", a: "Yes. Cancel anytime from Settings. No questions asked. Your plan stays active until the end of the billing period." },
  { q: "What payment methods are supported?", a: "UPI (recommended), credit/debit cards, net banking, and wallets — all via Razorpay." },
  { q: "Is there a free trial?", a: "Free plan gives you 5 featured books with levels 1-2. No credit card needed." },
  { q: "Can I switch plans?", a: "Yes! Upgrade or downgrade anytime. If you upgrade mid-cycle, you pay the prorated difference. Downgrade takes effect at next billing date." },
  { q: "What happens to my data if I downgrade?", a: "Your notes, highlights, and XP are never deleted. You just lose access to premium levels until you re-subscribe." },
];

const PlansPage = () => {
  const [annual, setAnnual] = useState(true);
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const currentPlan = user?.plan || "FREE";

  const handleSelectPlan = (plan: PlanConfig) => {
    if (plan.id === "FREE") return;
    const billingCycle = annual ? "ANNUAL" : "MONTHLY";
    if (isLoggedIn) {
      navigate(`/checkout?plan=${plan.id}&billingCycle=${billingCycle}`);
    } else {
      navigate("/signup", { state: { redirectTo: `/checkout?plan=${plan.id}&billingCycle=${billingCycle}` } });
    }
  };

  return (
    <div className="min-h-screen bg-surface-2 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-ink-1 mb-3">Choose Your Plan</h1>
          <p className="text-ink-3 text-lg mb-6">Invest in yourself for less than a coffee a day</p>

          {/* Monthly / Annual toggle */}
          <div className="inline-flex bg-background border border-border rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                !annual ? "bg-primary text-primary-foreground" : "text-ink-3"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                annual ? "bg-primary text-primary-foreground" : "text-ink-3"
              }`}
            >
              Annual
              <span className="text-[10px] bg-success text-white px-1.5 py-0.5 rounded-full ml-1.5">Save 2 months</span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {PLANS.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            const price = annual ? plan.annual : plan.monthly;
            const mrp = annual ? plan.annualMrp : plan.monthlyMrp;
            const perMonth = annual && plan.annual > 0
              ? Math.round(plan.annual / 12)
              : plan.monthly;

            return (
              <div
                key={plan.id}
                className={`bg-background rounded-2xl border-2 p-6 relative ${plan.color} flex flex-col`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </span>
                )}

                {annual && plan.id !== "FREE" && (
                  <span className="absolute top-3 right-3 bg-success text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Save 2 months
                  </span>
                )}

                <div className="flex items-center gap-2 mb-1">
                  {plan.icon && <plan.icon className="h-5 w-5 text-primary" />}
                  <h3 className="font-display text-lg font-bold text-ink-1">{plan.name}</h3>
                </div>
                <p className="text-xs text-ink-3 mb-3">{plan.tagline}</p>
                <p className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-lg mb-4">
                  {plan.whatYouGet}
                </p>

                <div className="mb-5">
                  {price === 0 ? (
                    <span className="text-3xl font-display font-bold text-ink-1">₹0</span>
                  ) : (
                    <>
                      <span className="text-3xl font-display font-bold text-ink-1">₹{perMonth}</span>
                      <span className="text-sm text-ink-3">/month</span>
                      {mrp > 0 && (
                        <span className="ml-2 text-sm text-ink-4 line-through">₹{annual ? Math.round(mrp / 12) : mrp}</span>
                      )}
                      {annual && (
                        <p className="text-xs text-ink-3 mt-1">
                          Billed ₹{plan.annual}/year
                          {plan.annualMrp > 0 && (
                            <span className="ml-1 text-ink-4 line-through">₹{plan.annualMrp}</span>
                          )}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-2 text-sm">
                      {f.included ? (
                        <Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-4 w-4 text-ink-4 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={f.included ? "text-ink-2" : "text-ink-4"}>{f.text}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${plan.badge ? "shadow-glow" : ""}`}
                  variant={plan.id === "FREE" ? "outline" : "default"}
                  disabled={isCurrentPlan}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {isCurrentPlan ? "Current Plan" : plan.cta}
                </Button>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-ink-1 text-center mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-ink-3">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default PlansPage;
