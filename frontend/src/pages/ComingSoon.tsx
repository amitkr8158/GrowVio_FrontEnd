import { useState } from 'react';
import { motion } from 'framer-motion';

const FEATURES = [
  { icon: '📚', label: '7-Level Knowledge Pyramid' },
  { icon: '🎯', label: 'Personalised Learning Paths' },
  { icon: '🏆', label: 'Gamified Achievements' },
  { icon: '🌐', label: 'Hindi & English Support' },
];

export default function ComingSoon() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex flex-col items-center justify-center px-4 py-16 text-white overflow-hidden">

      {/* Background glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full gap-8"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Logo / brand */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-5xl">📖</span>
          <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
            GrowVio
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="flex flex-col gap-3"
        >
          <h1 className="text-4xl sm:text-5xl font-black leading-tight">
            Something{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Exciting
            </span>
            {' '}is Coming
          </h1>
          <p className="text-slate-300 text-lg max-w-md mx-auto leading-relaxed">
            We're putting the final touches on GrowVio — your gamified book-summary
            platform built for Indian professionals.
          </p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {FEATURES.map((f) => (
            <span
              key={f.label}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 text-sm font-medium backdrop-blur-sm border border-white/10"
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </span>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="w-16 h-px bg-white/20" />

        {/* Notify me */}
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
        >
          {submitted ? (
            <motion.p
              className="text-green-400 font-semibold text-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              🎉 You're on the list! We'll notify you at launch.
            </motion.p>
          ) : (
            <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-400 transition backdrop-blur-sm text-sm"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 font-semibold text-sm transition-all active:scale-95 whitespace-nowrap"
              >
                Notify Me
              </button>
            </form>
          )}
          <p className="mt-2 text-xs text-slate-500">
            No spam — just a single launch notification.
          </p>
        </motion.div>

        {/* Footer note */}
        <motion.p
          className="text-slate-500 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          © {new Date().getFullYear()} GrowVio. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
}
