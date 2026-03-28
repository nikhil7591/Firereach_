export default function InputField({ label, hint, className = '', ...props }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.12em] text-[#A1A1AA]">{label}</span>
      <input
        {...props}
        className={`mt-2 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2.5 text-white placeholder:text-[#71717A] outline-none focus:border-indigo-400/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.22)] transition ${className}`}
      />
      {hint && <span className="mt-1 block text-[#A1A1AA] text-xs">{hint}</span>}
    </label>
  );
}
