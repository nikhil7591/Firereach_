import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'What types of outreach can FireReach automate?',
    a: 'FireReach handles the entire B2B cold outreach pipeline — from company discovery based on your Ideal Customer Profile (ICP), to signal harvesting, intelligent scoring, verified contact finding via Hunter.io, personalized email generation with Groq LLM, and automated sending with role-matched PDF pitch decks.',
  },
  {
    q: 'How does the 7-step AI agent pipeline work?',
    a: 'The agent runs 7 sequential steps: (1) Company Finder via Groq, (2) Signal Harvesting via Serper.dev, (3) Signal Verification, (4) Research Brief generation, (5) Company Scoring & Selection, (6) Email Finder via Hunter.io, and (7) Outreach Dispatch with PDF attachment. Steps 6-7 only run for the 1 best-scoring company, saving ~65% in API tokens.',
  },
  {
    q: 'What is the scoring model?',
    a: 'FireReach scores companies using: Final Score = (Signal Strength × 0.4) + (ICP Match × 0.6). Signal strength is calculated from 6 buying signals (Hiring, Funding, Leadership, Product Launch, Tech Stack, Market Reputation). ICP Match is weighted higher because a relevant company is always a better outreach target than a signal-rich but misaligned one.',
  },
  {
    q: 'What is the difference between Auto and Manual modes?',
    a: 'Auto Mode runs the full pipeline end-to-end without intervention — the agent selects the best company, best contact, and sends the email automatically. Manual Mode pauses at 3 checkpoints: company selection, contact selection, and send confirmation — giving you full control and the ability to edit the email before sending.',
  },
  {
    q: 'How does the PDF Intelligence system work?',
    a: 'FireReach includes 6 role-specific pitch PDFs (CTO, Founder, HR, Product, Investor, General). The agent automatically selects the best-fit PDF based on the recipient\'s role and ICP keywords. If no role match is found, it falls back to ICP bias keywords, then to a general pitch deck.',
  },
  {
    q: 'What APIs and integrations does FireReach use?',
    a: 'FireReach integrates with Groq (Llama 3.1 8B for company discovery, scoring, research briefs, and email generation), Serper.dev (Google Web + News for signal harvesting), Hunter.io (domain search for verified email contacts), and SMTP/Gmail (for email delivery with PDF attachments).',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-indigo-400 text-xs font-semibold tracking-widest uppercase mb-3">FAQ</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Frequently Asked <span className="italic font-serif text-white/80">Questions</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-3"
        >
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="landing-card-hover bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.1] transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left bg-transparent border-none cursor-pointer"
              >
                <span className="text-white text-sm font-medium pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#A1A1AA] flex-shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-[#A1A1AA] text-sm leading-relaxed font-light border-t border-white/[0.04] pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
