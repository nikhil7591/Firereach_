import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Flame, LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateUserProfile } from '../../services/api';

const SESSION_KEY = 'firereach_session';
const PROFILE_DETAILS_KEY = 'firereach_profile_details';
const SETTINGS_KEY = 'firereach_settings';

const getSession = () => {
  try {
    return JSON.parse(window.localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
};

const planToCredits = {
  FREE: 30,
  PRO: 2000,
  ENTERPRISE: 9999,
};

const planToLabel = {
  FREE: 'Free',
  PRO: 'Popular',
  ENTERPRISE: 'Custom',
};

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState(() => getSession());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    company: '',
    role: '',
    website: '',
    icpFocus: '',
  });
  const [settingsForm, setSettingsForm] = useState({
    emailAlerts: true,
    experimentalUI: false,
  });

  const sessionToken = session?.token || '';
  const currentPlan = String(session?.user?.plan || 'FREE').toUpperCase();
  const credits = Number(session?.user?.creditsRemaining ?? planToCredits[currentPlan] ?? 30);
  const monthlyCredits = Number(session?.user?.monthlyCredits ?? planToCredits[currentPlan] ?? 30);
  const plus = Boolean(session?.user?.plus || ['PRO', 'ENTERPRISE'].includes(currentPlan));
  const portalRoot = typeof document !== 'undefined' ? document.body : null;

  const initials = useMemo(() => {
    const name = String(session?.user?.name || '').trim();
    if (!name) {
      return 'U';
    }
    return name.charAt(0).toUpperCase();
  }, [session?.user?.name]);

  useEffect(() => {
    const syncSession = () => setSession(getSession());
    syncSession();

    window.addEventListener('storage', syncSession);
    window.addEventListener('firereach-session-updated', syncSession);
    return () => {
      window.removeEventListener('storage', syncSession);
      window.removeEventListener('firereach-session-updated', syncSession);
    };
  }, []);

  useEffect(() => {
    const storedProfile = JSON.parse(window.localStorage.getItem(PROFILE_DETAILS_KEY) || '{}');
    setProfileForm({
      name: session?.user?.name || storedProfile.name || '',
      company: storedProfile.company || '',
      role: storedProfile.role || '',
      website: storedProfile.website || '',
      icpFocus: storedProfile.icpFocus || '',
    });

    const storedSettings = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || '{}');
    setSettingsForm({
      emailAlerts: storedSettings.emailAlerts ?? true,
      experimentalUI: storedSettings.experimentalUI ?? false,
    });
  }, [session?.user?.name]);

  const handleLaunchClick = () => {
    if (!sessionToken) {
      navigate('/auth?mode=login');
      return;
    }
    navigate('/app');
  };

  const handleLogout = () => {
    window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem('firereach_user');
    setSession(null);
    setDropdownOpen(false);
    window.dispatchEvent(new Event('firereach-session-updated'));
    window.location.assign('/');
  };

  const openProfileModal = () => {
    navigate('/profile');
    setDropdownOpen(false);
  };

  const openSettingsModal = () => {
    navigate('/settings');
    setDropdownOpen(false);
  };

  const saveProfile = async () => {
    const payload = {
      ...profileForm,
      name: String(profileForm.name || '').trim(),
      company: String(profileForm.company || '').trim(),
      role: String(profileForm.role || '').trim(),
      website: String(profileForm.website || '').trim(),
      icpFocus: String(profileForm.icpFocus || '').trim(),
    };

    window.localStorage.setItem(PROFILE_DETAILS_KEY, JSON.stringify(payload));

    if (sessionToken && payload.name) {
      try {
        const response = await updateUserProfile(sessionToken, { name: payload.name });
        const nextSession = {
          ...getSession(),
          user: response.user,
        };
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
        window.localStorage.setItem('firereach_user', JSON.stringify(response.user));
        window.dispatchEvent(new Event('firereach-session-updated'));
      } catch {
        // Keep local profile data even if API update fails.
      }
    }

    setProfileModalOpen(false);
  };

  const saveSettings = () => {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsForm));
    setSettingsModalOpen(false);
  };

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Success Stories', href: '#success-stories' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Team', href: '#team' },
  ];

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-[9990] backdrop-blur-xl bg-[#050505]/80 border-b border-white/[0.06] isolate">
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 text-white font-bold text-2xl tracking-tight no-underline">
          <Flame className="w-7 h-7 text-orange-500" />
          <span>Fire<span className="text-orange-500">Reach</span></span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-8 list-none">
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href} className="text-[#A1A1AA] text-sm font-medium hover:text-white transition-colors no-underline">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3 relative">
          {sessionToken && (
            <div className="text-xs text-[#A1A1AA] border border-white/10 rounded-full px-3 py-1.5">
              {(planToLabel[currentPlan] || 'Free')}{plus ? '+' : ''}: <span className="text-white font-semibold">{credits}/{monthlyCredits} Credits</span>
            </div>
          )}

          {!sessionToken && (
            <Link
              to="/auth?mode=signup"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/15 text-white text-sm font-semibold hover:border-white/30 transition-colors no-underline"
            >
              Sign Up
            </Link>
          )}

          <button
            type="button"
            onClick={handleLaunchClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity border-none cursor-pointer"
          >
            Launch App
          </button>

          {sessionToken && (
            <button
              type="button"
              onClick={() => {
                setDropdownOpen((prev) => !prev);
              }}
              className="w-10 h-10 rounded-full border border-white/20 bg-white/5 text-white font-semibold cursor-pointer"
              aria-label="Open account menu"
            >
              {initials}
            </button>
          )}

        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white bg-transparent border-none cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/[0.06] overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-[#A1A1AA] text-sm font-medium hover:text-white transition-colors no-underline"
                >
                  {l.label}
                </a>
              ))}
              {!sessionToken && (
                <Link
                  to="/auth?mode=signup"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-white/15 text-white text-sm font-semibold no-underline"
                >
                  Sign Up
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleLaunchClick();
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold border-none cursor-pointer"
              >
                Launch App
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
    {portalRoot && sessionToken && dropdownOpen && createPortal(
      <div className="fixed right-6 top-[78px] w-[320px] rounded-xl border border-white/10 bg-[#0b0b12] shadow-2xl p-3 z-[2147483000]">
        <div className="space-y-2">
          <div className="px-3 py-2 rounded-lg border border-white/10 bg-white/5">
            <div className="text-[11px] text-[#A1A1AA]">Plan</div>
            <div className="text-sm text-white font-semibold">{(planToLabel[currentPlan] || 'Free')}{plus ? '+' : ''}</div>
            <div className="text-[11px] text-[#A1A1AA] mt-1">Credits: <span className="text-white">{credits}/{monthlyCredits}</span></div>
          </div>
          <button type="button" onClick={openProfileModal} className="w-full text-left px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10 border-none bg-transparent cursor-pointer">Profile</button>
          <button type="button" onClick={openSettingsModal} className="w-full text-left px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10 border-none bg-transparent cursor-pointer">Settings</button>
          <button type="button" onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-300 hover:bg-rose-500/20 border-none bg-transparent cursor-pointer inline-flex items-center gap-2"><LogOut className="w-4 h-4" />Logout</button>
        </div>
      </div>,
      portalRoot,
    )}

    {portalRoot && profileModalOpen && createPortal(
      <div className="fixed inset-0 z-[2147483001] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4" onClick={() => setProfileModalOpen(false)}>
        <div className="w-full max-w-xl rounded-2xl border border-white/15 bg-[#0b0b12] p-5" onClick={(event) => event.stopPropagation()}>
          <h3 className="text-white text-lg font-semibold mb-4">Profile Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="rounded-lg border border-white/15 bg-white/5 text-white px-3 py-2" placeholder="Full Name" value={profileForm.name} onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} />
            <input className="rounded-lg border border-white/10 bg-white/5 text-[#A1A1AA] px-3 py-2" value={session?.user?.email || ''} disabled />
            <input className="rounded-lg border border-white/15 bg-white/5 text-white px-3 py-2" placeholder="Company" value={profileForm.company} onChange={(e) => setProfileForm((p) => ({ ...p, company: e.target.value }))} />
            <input className="rounded-lg border border-white/15 bg-white/5 text-white px-3 py-2" placeholder="Role" value={profileForm.role} onChange={(e) => setProfileForm((p) => ({ ...p, role: e.target.value }))} />
            <input className="rounded-lg border border-white/15 bg-white/5 text-white px-3 py-2 sm:col-span-2" placeholder="Website" value={profileForm.website} onChange={(e) => setProfileForm((p) => ({ ...p, website: e.target.value }))} />
            <textarea className="rounded-lg border border-white/15 bg-white/5 text-white px-3 py-2 sm:col-span-2 min-h-[110px]" placeholder="ICP Focus / Best-fit customer notes" value={profileForm.icpFocus} onChange={(e) => setProfileForm((p) => ({ ...p, icpFocus: e.target.value }))} />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className="rounded-lg border border-white/15 bg-white/5 text-white px-3 py-2 text-sm" onClick={() => setProfileModalOpen(false)}>Cancel</button>
            <button type="button" className="rounded-lg border border-indigo-500/40 bg-indigo-500/20 text-white px-3 py-2 text-sm" onClick={saveProfile}>Save Profile</button>
          </div>
        </div>
      </div>,
      portalRoot,
    )}

    {portalRoot && settingsModalOpen && createPortal(
      <div className="fixed inset-0 z-[2147483001] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4" onClick={() => setSettingsModalOpen(false)}>
        <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0b0b12] p-5" onClick={(event) => event.stopPropagation()}>
          <h3 className="text-white text-lg font-semibold mb-4">Settings</h3>
          <label className="flex items-center justify-between text-sm text-white mb-3">
            Email Alerts
            <input type="checkbox" checked={settingsForm.emailAlerts} onChange={(e) => setSettingsForm((s) => ({ ...s, emailAlerts: e.target.checked }))} />
          </label>
          <label className="flex items-center justify-between text-sm text-white mb-3">
            Experimental UI
            <input type="checkbox" checked={settingsForm.experimentalUI} onChange={(e) => setSettingsForm((s) => ({ ...s, experimentalUI: e.target.checked }))} />
          </label>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className="rounded-lg border border-white/15 bg-white/5 text-white px-3 py-2 text-sm" onClick={() => setSettingsModalOpen(false)}>Close</button>
            <button type="button" className="rounded-lg border border-indigo-500/40 bg-indigo-500/20 text-white px-3 py-2 text-sm inline-flex items-center gap-1" onClick={saveSettings}><Settings className="w-4 h-4" />Save</button>
          </div>
        </div>
      </div>,
      portalRoot,
    )}
    </>
  );
}
