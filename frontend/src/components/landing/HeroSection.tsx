import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-hero pt-16">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
        backgroundSize: "40px 40px"
      }} />

      <div className="container relative mx-auto flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 lg:flex-row lg:gap-16">
        {/* Left - Copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl text-center lg:text-left"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/90 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span>5,000+ Indian professionals reading smarter</span>
          </div>

          <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            Read 100 Books<br />
            <span className="text-teal-light">This Year. Really.</span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-white/80 sm:text-xl">
            GrowVio turns any book into a 7-level knowledge pyramid — from 60-second summaries to full mastery. Learn at your depth.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button size="lg" className="h-14 rounded-xl bg-white px-8 text-base font-semibold text-primary-dark shadow-xl hover:bg-white/90" onClick={() => navigate("/login")}>
              Start Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="ghost" className="h-14 rounded-xl border border-white/30 px-8 text-base font-medium text-white hover:bg-white/10">
              See how it works
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 lg:justify-start">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-white/50 bg-white/20 backdrop-blur-sm" />
              ))}
            </div>
            <p className="text-sm text-white/70">Join 5,000+ readers across India</p>
          </div>
        </motion.div>

        {/* Right - Animated book stack */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 lg:mt-0"
        >
          <div className="relative">
            {/* Floating books */}
            <motion.div className="animate-float relative z-10 flex flex-col items-center gap-4">
              <div className="flex items-center gap-4">
                <BookCard title="Atomic Habits" color="bg-amber-400" delay={0} />
                <BookCard title="Deep Work" color="bg-blue-500" delay={0.2} />
              </div>
              <div className="flex items-center gap-4">
                <BookCard title="Psychology of Money" color="bg-emerald-500" delay={0.4} />
                <BookCard title="Ikigai" color="bg-rose-400" delay={0.6} />
              </div>
              <div className="flex items-center gap-4">
                <BookCard title="Think & Grow Rich" color="bg-violet-500" delay={0.8} />
              </div>
            </motion.div>

            {/* Glow effect */}
            <div className="absolute inset-0 -z-10 blur-3xl">
              <div className="h-full w-full rounded-full bg-white/10" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="h-10 w-6 rounded-full border-2 border-white/30 p-1">
          <div className="h-2 w-full rounded-full bg-white/60" />
        </div>
      </motion.div>
    </section>
  );
};

const BookCard = ({ title, color, delay }: { title: string; color: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 + delay, duration: 0.5 }}
    className="group relative"
  >
    <div className={`${color} h-36 w-24 rounded-lg shadow-xl transition-transform duration-300 group-hover:-translate-y-1 sm:h-44 sm:w-28`}>
      <div className="flex h-full flex-col justify-end p-2">
        <p className="text-[10px] font-semibold leading-tight text-white sm:text-xs">{title}</p>
      </div>
    </div>
  </motion.div>
);

export default HeroSection;
