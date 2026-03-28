import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import {
  getCurrentUserProfile,
  getCreditsStatus,
  getSearchHistoryList,
  getAccountPlan,
} from '../services/api';
import SectionWrapper from '../components/ui/SectionWrapper';
import ProfileCard from '../components/ui/ProfileCard';
import StatCard from '../components/ui/StatCard';
import ProgressBar from '../components/ui/ProgressBar';

const SESSION_KEY = 'firereach_session';

const getSession = () => {
  try {
    return JSON.parse(window.localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return 'N/A';
  }
};

export default function ProfilePage() {
  const [session, setSession] = useState(() => getSession());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(null);
  const [credits, setCredits] = useState(null);
  const [history, setHistory] = useState([]);

  const token = session?.token || '';

  useEffect(() => {
    const sync = () => setSession(getSession());
    window.addEventListener('storage', sync);
    window.addEventListener('firereach-session-updated', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('firereach-session-updated', sync);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!token) {
        setLoading(false);
        setError('Please login again to open profile.');
        return;
      }
      setLoading(true);
      setError('');
      try {
        const [meRes, planRes, creditRes, historyRes] = await Promise.all([
          getCurrentUserProfile(token),
          getAccountPlan(token),
          getCreditsStatus(token),
          getSearchHistoryList(token, 12),
        ]);
        if (!active) return;
        setUser(meRes.user || null);
        setPlan(planRes || null);
        setCredits(creditRes || null);
        setHistory(Array.isArray(historyRes.history) ? historyRes.history : []);
      } catch (loadError) {
        console.error('Profile load failed:', loadError);
        if (active) setError('Unable to load profile details right now.');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, [token]);

  const planLabel = useMemo(() => {
    const raw = String(plan?.plan || user?.plan || 'FREE').toUpperCase();
    if (raw === 'PRO') return 'Popular';
    if (raw === 'ENTERPRISE') return 'Custom';
    return 'Free';
  }, [plan?.plan, user?.plan]);

  const creditsRemaining = Number(credits?.creditsRemaining ?? user?.creditsRemaining ?? 0);
  const monthlyCredits = Number(credits?.monthlyCredits ?? user?.monthlyCredits ?? 0);
  const usedPercent = monthlyCredits > 0 ? Math.round(((monthlyCredits - creditsRemaining) / monthlyCredits) * 100) : 0;

  const recentActivity = history.slice(0, 3).map((item) => ({
    id: item.id,
    title: item.icp,
    when: formatDate(item.createdAt),
  }));

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_14%_12%,rgba(99,102,241,0.18),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(249,115,22,0.12),transparent_28%)]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-300 text-xs uppercase tracking-[0.16em]">FireReach Account</p>
            <h1 className="text-white text-2xl md:text-3xl font-bold">Profile</h1>
          </div>
          <Link to="/" className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white no-underline">Back To Home</Link>
        </div>

        {error && <div className="rounded-lg border border-rose-400/35 bg-rose-500/10 text-rose-300 px-3 py-2 text-sm">{error}</div>}
        {loading && <div className="rounded-lg border border-white/10 bg-white/[0.03] text-[#A1A1AA] px-3 py-2 text-sm">Fetching latest profile data...</div>}

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <SectionWrapper title="Account Overview" subtitle="Identity and plan details" delay={0.02}>
              <ProfileCard
                name={user?.name}
                email={user?.email}
                planLabel={planLabel}
                joinDate={formatDate(user?.createdAt)}
                avatarUrl=""
              />
            </SectionWrapper>
          </div>

          <SectionWrapper title="Actions" subtitle="Quick account actions" delay={0.06}>
            <div className="space-y-2">
              <motion.button whileHover={{ scale: 1.02 }} className="w-full rounded-lg border border-indigo-400/40 bg-indigo-500/20 px-3 py-2 text-white text-sm">Edit Profile</motion.button>
              <motion.button whileHover={{ scale: 1.02 }} className="w-full rounded-lg border border-orange-400/40 bg-orange-500/20 px-3 py-2 text-white text-sm">Upgrade Plan</motion.button>
            </div>
          </SectionWrapper>
        </div>

        <SectionWrapper title="Credits & Usage" subtitle="Current cycle credit consumption" delay={0.1}>
          <div className="grid md:grid-cols-3 gap-3">
            <StatCard label="Credits Remaining" value={creditsRemaining} accent="orange" />
            <StatCard label="Monthly Credits" value={monthlyCredits} accent="indigo" />
            <StatCard label="Next Reset" value={formatDate(credits?.nextResetAt || plan?.nextResetAt || user?.nextResetAt)} accent="emerald" />
          </div>
          <div className="mt-4">
            <ProgressBar value={usedPercent} />
          </div>
        </SectionWrapper>

        <div className="grid lg:grid-cols-3 gap-4">
          <SectionWrapper title="Activity" subtitle="Recent account events" delay={0.14}>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <StatCard label="Last Login" value={formatDate(session?.user?.updatedAt || user?.updatedAt)} />
              <StatCard label="History Items" value={history.length} />
            </div>

            <div className="space-y-2">
              {recentActivity.length === 0 && <p className="text-[#A1A1AA] text-sm">No recent activity found.</p>}
              {recentActivity.map((item) => (
                <div key={item.id} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                  <p className="text-white text-sm line-clamp-2">{item.title}</p>
                  <p className="text-[#A1A1AA] text-xs mt-1">{item.when}</p>
                </div>
              ))}
            </div>
          </SectionWrapper>

          <SectionWrapper title="Plan Summary" subtitle="Subscription status at a glance" delay={0.18}>
            <div className="space-y-2 text-sm">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 flex items-center justify-between">
                <span className="text-[#A1A1AA]">Current Plan</span>
                <span className="text-white font-semibold">{planLabel}</span>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 flex items-center justify-between">
                <span className="text-[#A1A1AA]">Email</span>
                <span className="text-white font-semibold truncate pl-3">{user?.email || 'N/A'}</span>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 flex items-center justify-between">
                <span className="text-[#A1A1AA]">User ID</span>
                <span className="text-white font-semibold truncate pl-3">{user?.id || 'N/A'}</span>
              </div>
            </div>
          </SectionWrapper>
        </div>
      </div>
    </div>
  );
}
