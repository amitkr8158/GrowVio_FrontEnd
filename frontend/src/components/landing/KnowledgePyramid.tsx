import { motion } from "framer-motion";
import { Lock, Unlock } from "lucide-react";

const levels = [
  { level: 7, name: "Full Mastery", words: "5000+ words", plan: "PRO", color: "bg-danger", lightColor: "bg-danger-light", textColor: "text-danger" },
  { level: 6, name: "Expert Analysis", words: "3000 words", plan: "PREMIUM", color: "bg-primary", lightColor: "bg-accent", textColor: "text-primary" },
  { level: 5, name: "Deep Dive", words: "2000 words", plan: "PREMIUM", color: "bg-primary", lightColor: "bg-accent", textColor: "text-primary" },
  { level: 4, name: "Detailed Summary", words: "1200 words", plan: "STARTER", color: "bg-info", lightColor: "bg-info-light", textColor: "text-info" },
  { level: 3, name: "Key Insights", words: "600 words", plan: "FREE", color: "bg-success", lightColor: "bg-success-light", textColor: "text-success" },
  { level: 2, name: "Chapter Highlights", words: "300 words", plan: "FREE", color: "bg-success", lightColor: "bg-success-light", textColor: "text-success" },
  { level: 1, name: "60-Second Overview", words: "150 words", plan: "FREE", color: "bg-success", lightColor: "bg-success-light", textColor: "text-success" },
];

const KnowledgePyramid = () => {
  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            The Knowledge Pyramid
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-ink-3">
            7 levels of depth for every book. Start free, go deeper when you're ready.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 flex max-w-2xl flex-col items-center gap-2">
          {levels.map((level, i) => {
            const widthPercent = 40 + (levels.length - i) * 8.5;
            const isFree = level.plan === "FREE";

            return (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, scaleX: 0.8 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                style={{ width: `${widthPercent}%` }}
                className={`group relative cursor-pointer overflow-hidden rounded-xl border px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${level.lightColor} border-transparent`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-md ${level.color} font-mono text-xs font-bold text-white`}>
                      L{level.level}
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${level.textColor}`}>{level.name}</p>
                      <p className="text-xs text-ink-3">{level.words}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isFree ? "bg-success/10 text-success" : `${level.color}/10 ${level.textColor}`}`}>
                      {level.plan}
                    </span>
                    {isFree ? (
                      <Unlock className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-ink-4" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center text-sm text-ink-3"
        >
          Levels 1-3 are always free. Upgrade anytime to go deeper.
        </motion.p>
      </div>
    </section>
  );
};

export default KnowledgePyramid;
