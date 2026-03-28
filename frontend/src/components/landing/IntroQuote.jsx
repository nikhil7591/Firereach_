import { motion } from 'framer-motion';

export default function IntroQuote() {
  return (
    <section className="py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.7 }}
        className="max-w-3xl mx-auto text-center"
      >
        <p className="text-2xl sm:text-3xl md:text-4xl font-serif italic text-white/90 leading-snug mb-8">
          "Define your ICP. Deploy the agent. Personalized outreach delivered in under 3 minutes — zero manual effort."
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            NK
          </div>
          <div className="text-left">
            <div className="text-white font-semibold text-sm">Nikhil Kumar</div>
            <div className="text-[#A1A1AA] text-xs">Founder & AI Strategy Lead</div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
