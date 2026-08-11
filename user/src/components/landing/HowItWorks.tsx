import { motion } from "framer-motion";
import { BookOpen, Layers, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: BookOpen,
    title: "Choose a Book",
    description: "Browse 500+ curated titles across business, self-help, productivity and more — in English and Hindi.",
    color: "bg-success-light text-success",
  },
  {
    icon: Layers,
    title: "Pick Your Depth",
    description: "Each book has 7 levels — from a 60-second overview to deep mastery. Start where you want.",
    color: "bg-accent text-primary",
  },
  {
    icon: TrendingUp,
    title: "Apply & Track",
    description: "Earn XP, maintain streaks, unlock badges and climb the leaderboard as you grow.",
    color: "bg-warning-light text-warning",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="bg-surface-2 py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            How GrowVio Works
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-ink-3">
            Three simple steps to accelerate your learning
          </p>
        </motion.div>

        <div className="relative mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-3">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 top-12 hidden h-0.5 bg-border md:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl ${step.color} shadow-sm`}>
                <step.icon className="h-10 w-10" />
              </div>
              <div className="mt-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary font-mono text-sm font-bold text-primary-foreground">
                {i + 1}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-3">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
