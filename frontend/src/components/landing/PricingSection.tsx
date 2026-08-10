import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X, Crown, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: { monthly: 0, annual: 0 },
    description: "Get started with book summaries",
    features: [
      { text: "Levels 1-3 for all books", included: true },
      { text: "5 books per month", included: true },
      { text: "Basic progress tracking", included: true },
      { text: "Deep dive levels", included: false },
      { text: "Workbooks & exercises", included: false },
    ],
    cta: "Start Free",
    variant: "outline" as const,
    badge: null,
    borderClass: "border-border",
    icon: null,
  },
  {
    name: "Starter",
    price: { monthly: 99, annual: 79 },
    description: "Unlock deeper insights",
    features: [
      { text: "Everything in Free", included: true },
      { text: "Level 4 detailed summaries", included: true },
      { text: "Unlimited books", included: true },
      { text: "Offline reading", included: true },
      { text: "Expert analysis levels", included: false },
    ],
    cta: "Get Starter",
    variant: "outline" as const,
    badge: null,
    borderClass: "border-info",
    icon: null,
  },
  {
    name: "Premium",
    price: { monthly: 199, annual: 159 },
    description: "Full knowledge mastery",
    features: [
      { text: "Everything in Starter", included: true },
      { text: "Levels 5-6 deep dives", included: true },
      { text: "Workbooks & exercises", included: true },
      { text: "Priority support", included: true },
      { text: "Team features", included: false },
    ],
    cta: "Get Premium",
    variant: "default" as const,
    badge: "Most Popular",
    borderClass: "border-primary shadow-glow",
    icon: Crown,
  },
  {
    name: "Pro",
    price: { monthly: 499, annual: 399 },
    description: "Ultimate learning experience",
    features: [
      { text: "Everything in Premium", included: true },
      { text: "Level 7 full mastery", included: true },
      { text: "1-on-1 mentoring sessions", included: true },
      { text: "Custom reading plans", included: true },
      { text: "API access", included: true },
    ],
    cta: "Get Pro",
    variant: "outline" as const,
    badge: "Most Value",
    borderClass: "border-warning",
    icon: Star,
  },
];

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const navigate = useNavigate();

  return (
    <section id="pricing" className="bg-surface-2 py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-ink-3">
            Start free, upgrade when you need deeper knowledge
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-surface-3 p-1">
            <button
              onClick={() => setIsAnnual(false)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${!isAnnual ? "bg-background text-foreground shadow-sm" : "text-ink-3"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${isAnnual ? "bg-background text-foreground shadow-sm" : "text-ink-3"}`}
            >
              Annual <span className="ml-1 text-xs text-success">Save 20%</span>
            </button>
          </div>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border bg-background p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${plan.borderClass}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
                  {plan.badge}
                </div>
              )}

              <div className="flex items-center gap-2">
                {plan.icon && <plan.icon className="h-5 w-5 text-primary" />}
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
              </div>

              <div className="mt-4">
                <span className="font-mono text-3xl font-bold text-foreground">
                  ₹{isAnnual ? plan.price.annual : plan.price.monthly}
                </span>
                {plan.price.monthly > 0 && (
                  <span className="text-sm text-ink-3">/mo</span>
                )}
              </div>

              <p className="mt-2 text-sm text-ink-3">{plan.description}</p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2 text-sm">
                    {f.included ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-ink-4" />
                    )}
                    <span className={f.included ? "text-ink-2" : "text-ink-4"}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.variant}
                className={`mt-6 w-full rounded-lg ${plan.variant === "default" ? "bg-primary text-primary-foreground shadow-glow hover:opacity-90" : ""}`}
                onClick={() => navigate("/login")}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
