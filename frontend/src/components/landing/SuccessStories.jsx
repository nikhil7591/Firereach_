import { motion } from 'framer-motion';
import { TrendingUp, Clock, Target, ArrowUpRight } from 'lucide-react';

const stories = [
  {
    name: "SaaS Company's Outreach Revolution",
    subtitle: 'B2B SaaS · 120 employees',
    description: 'Replaced 3 SDRs worth of manual prospecting. FireReach agent handles ICP-to-inbox automation with live streaming, cutting pipeline build time from 4 hours to under 3 minutes.',
    metrics: [
      { value: '~65%', label: 'Token Savings', icon: TrendingUp },
      { value: '<3 min', label: 'Full Pipeline', icon: Clock },
    ],
    accent: 'from-indigo-500 to-purple-500',
    borderAccent: 'border-indigo-500/30',
  },
  {
    name: "AI Startup's Lead Quality Boost",
    subtitle: 'AI/ML · Series A',
    description: 'Intelligent scoring model (Signal × 0.4 + ICP × 0.6) automatically selects the highest-fit company. Gold-highlighted rank 1 results in 3x better reply rates vs random outreach.',
    metrics: [
      { value: '3×', label: 'Better Reply Rate', icon: Target },
      { value: '94', label: 'ICP Match Score', icon: TrendingUp },
    ],
    accent: 'from-purple-500 to-pink-500',
    borderAccent: 'border-purple-500/30',
  },
  {
    name: "Agency's Multi-Client Scale",
    subtitle: 'Marketing Agency · 50+ clients',
    description: 'Uses FireReach across multiple client ICPs. PDF Intelligence auto-selects the right pitch deck per recipient role. Auto + Manual modes give full control over send quality.',
    metrics: [
      { value: '6', label: 'Role-Specific PDFs', icon: ArrowUpRight },
      { value: '50+', label: 'Clients Served', icon: Target },
    ],
    accent: 'from-amber-500 to-orange-500',
    borderAccent: 'border-amber-500/30',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function SuccessStories() {
  return (
    <section id="success-stories" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-indigo-400 text-xs font-semibold tracking-widest uppercase mb-3">Success Stories</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Real Results. <span className="italic font-serif text-white/80">Real Impact.</span>
          </h2>
          <p className="text-[#A1A1AA] text-base max-w-lg leading-relaxed mb-12 font-light">
            See how teams use FireReach's autonomous agent to transform B2B outreach.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-5"
        >
          {stories.map((s) => (
            <motion.div
              key={s.name}
              variants={item}
              className={`landing-card-hover relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-300`}
            >
              <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${s.accent} rounded-t-2xl`} />

              <h3 className="text-white font-semibold text-lg mb-1">{s.name}</h3>
              <p className="text-[#A1A1AA] text-xs font-medium mb-4">{s.subtitle}</p>
              <p className="text-[#A1A1AA] text-sm leading-relaxed font-light mb-6">{s.description}</p>

              <div className="flex gap-4">
                {s.metrics.map((m) => (
                  <div key={m.label} className={`landing-card-hover flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center`}>
                    <m.icon className="w-4 h-4 text-indigo-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{m.value}</div>
                    <div className="text-[10px] text-[#A1A1AA] mt-1 font-medium uppercase tracking-wide">{m.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
