import { motion } from 'framer-motion';
import { Bot, Workflow, BarChart3, Mail, LineChart, Plug } from 'lucide-react';

const codeSnippet = `class OutreachAgent:
    def __init__(self, icp_text):
        self.icp = icp_text
        self.pipeline = "ready"

    def deploy(self):
        companies = self.find_companies()
        signals = self.harvest_signals()
        best = self.score_and_select()
        contacts = self.find_emails(best)
        self.send_outreach(contacts[0])
        return "Email sent ✓"`;

const services = [
  {
    icon: Bot,
    title: 'AI Company Discovery',
    desc: 'Groq LLM analyzes your ICP and returns 5 real, validated companies as structured JSON. Cards render live instantly on your dashboard.',
    color: 'from-indigo-500/20 to-purple-500/20',
    borderColor: 'border-indigo-500/20',
  },
  {
    icon: Workflow,
    title: '7-Step Agent Pipeline',
    desc: 'From company finder to email dispatch — 7 autonomous steps run end-to-end. Signal harvest, verify, research, score, find contacts, send.',
    color: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/20',
  },
  {
    icon: BarChart3,
    title: 'Intelligent Scoring',
    desc: 'Final Score = (Signal × 0.4) + (ICP Match × 0.6). Single Groq call scores all 5 companies. Rank 1 is gold-highlighted automatically.',
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/20',
  },
  {
    icon: Mail,
    title: 'Verified Email Contacts',
    desc: 'Hunter.io domain search finds top 5 verified contacts. Personal emails always prioritized. Generic inboxes strictly last resort — never fabricated.',
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/20',
  },
  {
    icon: LineChart,
    title: 'Live Streaming UX',
    desc: 'NDJSON streaming delivers real-time updates. Companies, rankings, contacts, and email preview all appear progressively — never a blank screen.',
    color: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-500/20',
  },
  {
    icon: Plug,
    title: 'PDF Intelligence Layer',
    desc: 'Role + ICP keyword matching auto-selects 1 of 6 pitch PDFs per recipient. Personalization goes beyond text — to attachments.',
    color: 'from-rose-500/20 to-red-500/20',
    borderColor: 'border-rose-500/20',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Services() {
  return (
    <section id="features" className="relative py-24 px-6">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse,rgba(99,102,241,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-indigo-400 text-xs font-semibold tracking-widest uppercase mb-3">Core Capabilities</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Smarter Outreach, <span className="italic font-serif text-white/80">Built with AI</span>
          </h2>
          <p className="text-[#A1A1AA] text-base max-w-lg leading-relaxed mb-12 font-light">
            Every feature designed to eliminate manual B2B prospecting entirely.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              variants={item}
              className={`landing-card-hover group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-300 ${i === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}
            >
              {/* Top line accent */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${s.color} rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />

              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} border ${s.borderColor} flex items-center justify-center mb-4`}>
                <s.icon className="w-5 h-5 text-white/80" />
              </div>
              <h3 className="text-white font-semibold text-base mb-2">{s.title}</h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed font-light">{s.desc}</p>
            </motion.div>
          ))}

          {/* Code Block Card */}
          <motion.div
            variants={item}
            className="landing-card-hover relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-300 md:col-span-2 lg:col-span-3"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-white font-semibold text-base mb-2">Custom AI Agent Development</h3>
                <p className="text-[#A1A1AA] text-sm leading-relaxed font-light mb-4">
                  FireReach's autonomous agent is purpose-built for B2B outreach. From ICP analysis to email delivery with PDF attachments — the full pipeline runs without a single human touch.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Groq / Llama 3', 'Serper.dev', 'Hunter.io', 'SMTP', 'PDF Selector'].map((t) => (
                    <span key={t} className="text-[10px] px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex-1 bg-[#0c0c14] rounded-xl border border-white/[0.06] p-4 overflow-x-auto">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  <span className="text-[10px] text-[#A1A1AA] ml-2 font-mono">outreach_agent.py</span>
                </div>
                <pre className="text-xs leading-relaxed font-mono">
                  <code>
                    {codeSnippet.split('\n').map((line, li) => (
                      <div key={li}>
                        <span className="text-[#555] select-none mr-3">{String(li + 1).padStart(2, ' ')}</span>
                        {colorize(line)}
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function colorize(line) {
  const trimmed = line.trimStart();
  if (trimmed.startsWith('class '))
    return <><span className="text-purple-400">class </span><span className="text-yellow-300">{trimmed.slice(6).replace(':', '')}</span><span className="text-white">:</span></>;
  if (trimmed.startsWith('def '))
    return <><span className="text-[#888]">{line.match(/^\s*/)[0]}</span><span className="text-blue-400">def </span><span className="text-yellow-200">{trimmed.slice(4).split('(')[0]}</span><span className="text-white">({trimmed.split('(').slice(1).join('(')})</span></>;
  if (trimmed.startsWith('self.'))
    return <><span className="text-[#888]">{line.match(/^\s*/)[0]}</span><span className="text-red-400">self</span><span className="text-white">.{trimmed.slice(5)}</span></>;
  if (trimmed.startsWith('return '))
    return <><span className="text-[#888]">{line.match(/^\s*/)[0]}</span><span className="text-purple-400">return </span><span className="text-green-400">{trimmed.slice(7)}</span></>;
  if (trimmed.includes('='))
    return <span className="text-white">{line}</span>;
  return <span className="text-white/70">{line}</span>;
}
