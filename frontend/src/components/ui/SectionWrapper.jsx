import { motion } from 'framer-motion';

export default function SectionWrapper({ title, subtitle, children, delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay }}
      whileHover={{ scale: 1.01 }}
      className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.35)] p-4 md:p-5"
    >
      {(title || subtitle) && (
        <div className="mb-3 md:mb-4">
          {title && <h3 className="text-white font-semibold text-lg tracking-tight">{title}</h3>}
          {subtitle && <p className="text-[#A1A1AA] text-sm mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </motion.section>
  );
}
