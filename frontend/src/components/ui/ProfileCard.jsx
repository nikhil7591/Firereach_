export default function ProfileCard({ name, email, planLabel, joinDate, avatarUrl }) {
  const initials = String(name || email || 'U')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="w-16 h-16 rounded-full border border-white/15 bg-gradient-to-br from-indigo-500/40 to-orange-500/30 flex items-center justify-center overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt="User avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-white font-bold text-lg">{initials}</span>
        )}
      </div>

      <div className="min-w-0">
        <h4 className="text-white font-semibold text-xl truncate">{name || 'FireReach User'}</h4>
        <p className="text-[#A1A1AA] text-sm truncate">{email || 'No email'}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full border border-indigo-400/35 bg-indigo-500/15 text-indigo-200 font-semibold">{planLabel}</span>
          <span className="text-[#A1A1AA]">Joined {joinDate}</span>
        </div>
      </div>
    </div>
  );
}
