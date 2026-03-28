import { motion } from 'framer-motion';
import { Linkedin, Twitter, Instagram } from 'lucide-react';

const members = [
  { name: 'Nikhil Kumar', role: 'Founder & Lead Engineer', initials: 'NK', gradient: 'from-indigo-500 to-purple-600' }
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

export default function Team() {
  return (
    <section id="team" className="py-24 px-6">
      <div className="max-w-6xl mx-auto ">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-indigo-400 text-xs font-semibold tracking-widest uppercase mb-3">Our Team</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            The Minds Behind <span className="italic font-serif text-white/80">FireReach</span>
          </h2>
          <p className="text-[#A1A1AA] text-base max-w-lg mx-auto leading-relaxed font-light">
            A passionate team building the future of autonomous B2B outreach.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="flex flex-wrap justify-center gap-5"
        >
          {members.map((m) => (
            <motion.div
              key={m.name}
              variants={item}
              className="landing-card-hover w-full sm:w-[340px] bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 text-center hover:border-white/[0.12] transition-all duration-300"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white font-bold text-lg mx-auto mb-4`}>
                {m.initials}
              </div>
              <h3 className="text-white font-semibold text-base mb-1">{m.name}</h3>
              <p className="text-[#A1A1AA] text-xs font-medium mb-4">{m.role}</p>
              <div className="flex items-center justify-center gap-3">
                <a href="#" className="text-[#A1A1AA] hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
                <a href="#" className="text-[#A1A1AA] hover:text-white transition-colors"><Instagram className="w-4 h-4" /></a>
                <a href="#" className="text-[#A1A1AA] hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
