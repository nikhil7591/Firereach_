import { motion } from 'framer-motion';

const steps = [
  { num: 1, name: 'Company Finder', desc: 'Groq LLM analyzes your ICP and returns 5 real validated companies as structured JSON. Cards render live instantly.', tag: 'Groq / Llama 3', tagColor: 'bg-purple-500/15 text-purple-400 border-purple-500/25' },
  { num: 2, name: 'Signal Harvest', desc: 'Serper.dev fetches 6 buying signal types per company — Hiring, Funding, Leadership, Product, Tech Stack, Market.', tag: 'Serper.dev', tagColor: 'bg-green-500/15 text-green-400 border-green-500/25' },
  { num: 3, name: 'Signal Verify', desc: 'Rule-based filter removes empty, duplicate, and error-flagged signals. Only clean data moves forward.', tag: 'Pipeline Guard', tagColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25' },
  { num: 4, name: 'Research Brief', desc: 'Groq builds a 2-paragraph account brief per company referencing the strongest verified signals.', tag: 'Groq / Llama 3', tagColor: 'bg-purple-500/15 text-purple-400 border-purple-500/25' },
  { num: 5, name: 'Company Selector', desc: 'Score = (Signal × 0.4) + (ICP Match × 0.6). Single Groq call scores all 5. Rank 1 auto-selected with gold highlight.', tag: 'Scoring Model', tagColor: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  { num: 6, name: 'Email Finder', desc: 'Hunter.io domain search finds top 5 verified contacts. Personal emails prioritized. Generic inboxes strictly last resort.', tag: 'Hunter.io', tagColor: 'bg-orange-500/15 text-orange-400 border-orange-500/25' },
  { num: 7, name: 'Outreach Dispatch', desc: 'Groq generates a fully personalized email. PDF Intelligence selects the best pitch deck. SMTP delivers email + PDF.', tags: [
    { label: 'Groq Email', color: 'bg-purple-500/15 text-purple-400 border-purple-500/25' },
    { label: 'PDF Selector', color: 'bg-rose-500/15 text-rose-400 border-rose-500/25' },
    { label: 'SMTP', color: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  ] },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

export default function Pipeline() {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-indigo-400 text-xs font-semibold tracking-widest uppercase mb-3">7-Step Agent</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Every Step. <span className="italic font-serif text-white/80">Autonomous.</span>
          </h2>
          <p className="text-[#A1A1AA] text-base max-w-lg leading-relaxed mb-12 font-light">
            From ICP to inbox — the full pipeline runs without a single human touch.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {steps.map((s) => (
            <motion.div
              key={s.num}
              variants={item}
              className={`landing-card-hover group bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-300 ${s.num === 7 ? 'sm:col-span-2 lg:col-span-3' : ''}`}
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold mb-4">
                {s.num}
              </div>
              <h3 className="text-white font-semibold text-base mb-2">{s.name}</h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed font-light mb-4">{s.desc}</p>
              <div className="flex flex-wrap gap-2">
                {s.tags ? s.tags.map((t) => (
                  <span key={t.label} className={`text-[10px] px-2.5 py-1 rounded border font-semibold ${t.color}`}>{t.label}</span>
                )) : (
                  <span className={`text-[10px] px-2.5 py-1 rounded border font-semibold ${s.tagColor}`}>{s.tag}</span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
