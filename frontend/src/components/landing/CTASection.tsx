import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-gradient-hero p-12 text-center sm:p-16"
        >
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Start reading smarter today
          </h2>
          <p className="mx-auto mt-4 max-w-md text-lg text-white/80">
            Join 5,000+ Indian professionals who are accelerating their learning with GrowVio.
          </p>
          <Button
            size="lg"
            className="mt-8 h-14 rounded-xl bg-white px-8 text-base font-semibold text-primary-dark shadow-xl hover:bg-white/90"
            onClick={() => navigate("/login")}
          >
            Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="mt-4 text-sm text-white/60">No credit card required</p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
