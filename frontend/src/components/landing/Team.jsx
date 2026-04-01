import { useState } from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Instagram, X } from 'lucide-react';

const members = [
  {
    name: 'Nikhil Kumar',
    role: 'Founder & Lead Engineer',
    initials: 'NK',
    gradient: 'from-indigo-500 to-purple-600',
    about: 'Nikhil Kumar is the founder of FireReach, an AI-powered outreach automation platform built to simplify and scale modern B2B client acquisition.\n\nFireReach is designed to help businesses identify, target, and connect with the right clients without manual effort. It leverages a multi-agent AI system that transforms a simple Ideal Customer Profile (ICP) into a complete outreach workflow — from discovering relevant companies and analyzing buying signals to generating personalized emails and delivering them automatically.\n\nBuilt with a focus on efficiency, scalability, and real-world usability, FireReach eliminates repetitive sales tasks and enables teams to focus on closing deals rather than finding leads.\n\nThis project showcases how autonomous AI systems can streamline B2B sales processes and unlock intelligent, end-to-end automation.',
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

export default function Team() {
  const [selectedMember, setSelectedMember] = useState(null);

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
              onClick={() => setSelectedMember(m)}
              className="landing-card-hover w-full sm:w-[340px] bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 text-center hover:border-white/[0.12] transition-all duration-300 cursor-pointer"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white font-bold text-lg mx-auto mb-4`}>
                {m.initials}
              </div>
              <h3 className="text-white font-semibold text-base mb-1">{m.name}</h3>
              <p className="text-[#A1A1AA] text-xs font-medium mb-4">{m.role}</p>
              <div className="flex items-center justify-center gap-3">
                <a href="#" onClick={(e) => e.stopPropagation()} className="text-[#A1A1AA] hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
                <a href="#" onClick={(e) => e.stopPropagation()} className="text-[#A1A1AA] hover:text-white transition-colors"><Instagram className="w-4 h-4" /></a>
                <a href="#" onClick={(e) => e.stopPropagation()} className="text-[#A1A1AA] hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {selectedMember && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedMember(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl border border-white/10 p-6 md:p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${selectedMember.gradient} flex items-center justify-center text-white font-bold text-lg`}>
                  {selectedMember.initials}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedMember.name}</h2>
                  <p className="text-indigo-300 text-sm">{selectedMember.role}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-[#A1A1AA] hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="border-t border-white/10 pt-4">
              <h3 className="text-lg font-semibold text-white mb-3">About Me</h3>
              <div className="space-y-4 text-[#A1A1AA] text-sm leading-relaxed">
                {selectedMember.about.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
