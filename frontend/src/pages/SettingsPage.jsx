import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  getCurrentUserProfile,
  getCreditsStatus,
  getAccountPlan,
  getPaymentHistory,
  updateUserProfile,
} from '../services/api';
import SectionWrapper from '../components/ui/SectionWrapper';
import SettingsTabs from '../components/ui/SettingsTabs';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import InputField from '../components/ui/InputField';

const SESSION_KEY = 'firereach_session';
const PREF_KEY = 'firereach_outreach_preferences';

const getSession = () => {
  try {
    return JSON.parse(window.localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
};

const defaultPrefs = {
  defaultSendMode: 'auto',
  defaultTestEmail: '',
  saveHistory: true,
  autoSelectCompany: true,
  autoSelectContact: true,
};

export default function SettingsPage() {
  const [session, setSession] = useState(() => getSession());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('account');

  const [accountForm, setAccountForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '' });
  const [prefs, setPrefs] = useState(defaultPrefs);
  const [plan, setPlan] = useState(null);
  const [credits, setCredits] = useState(null);
  const [payments, setPayments] = useState([]);

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
    const stored = window.localStorage.getItem(PREF_KEY);
    if (stored) {
      try {
        setPrefs({ ...defaultPrefs, ...JSON.parse(stored) });
      } catch {
        setPrefs(defaultPrefs);
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!token) {
        setError('Please login again to open settings.');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [meRes, planRes, creditsRes, paymentRes] = await Promise.all([
          getCurrentUserProfile(token),
          getAccountPlan(token),
          getCreditsStatus(token),
          getPaymentHistory(token, 8),
        ]);
        if (!active) return;
        setAccountForm({
          name: meRes.user?.name || '',
          email: meRes.user?.email || '',
        });
        setPlan(planRes || null);
        setCredits(creditsRes || null);
        setPayments(Array.isArray(paymentRes.payments) ? paymentRes.payments : []);
      } catch (loadError) {
        console.error('Settings load failed:', loadError);
        if (active) setError('Unable to load settings right now.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [token]);

  const tabs = useMemo(() => [
    { id: 'account', label: 'Account' },
    { id: 'security', label: 'Security' },
    { id: 'outreach', label: 'Outreach Preferences' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'billing', label: 'Billing & Plan' },
  ], []);

  const saveAccount = async () => {
    if (!token) return;
    setError('');
    setSuccess('');
    try {
      const res = await updateUserProfile(token, { name: accountForm.name });
      const current = getSession();
      const nextSession = {
        ...(current || {}),
        user: res.user,
      };
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      window.localStorage.setItem('firereach_user', JSON.stringify(res.user));
      window.dispatchEvent(new Event('firereach-session-updated'));
      setSuccess('Profile name updated successfully.');
    } catch (saveError) {
      console.error('Save account failed:', saveError);
      setError('Unable to save account details right now.');
    }
  };

  const savePrefs = () => {
    window.localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
    setSuccess('Outreach preferences saved.');
  };

  const planLabel = String(plan?.plan || 'FREE').toUpperCase();

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_12%_10%,rgba(99,102,241,0.18),transparent_32%),radial-gradient(circle_at_84%_18%,rgba(249,115,22,0.1),transparent_30%)]" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-300 text-xs uppercase tracking-[0.16em]">FireReach Preferences</p>
            <h1 className="text-white text-2xl md:text-3xl font-bold">Settings</h1>
          </div>
          <Link to="/" className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white no-underline">Back To Home</Link>
        </div>

        {error && <div className="rounded-lg border border-rose-400/35 bg-rose-500/10 text-rose-300 px-3 py-2 text-sm">{error}</div>}
        {success && <div className="rounded-lg border border-emerald-400/35 bg-emerald-500/10 text-emerald-300 px-3 py-2 text-sm">{success}</div>}
        {loading && <div className="rounded-lg border border-white/10 bg-white/[0.03] text-[#A1A1AA] px-3 py-2 text-sm">Fetching latest settings data...</div>}

        <SectionWrapper title="Settings Control Center" subtitle="Manage account, security, outreach behavior, and billing.">
          <SettingsTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab}>
            {activeTab === 'account' && (
              <div className="space-y-4">
                <InputField
                  label="Name"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                />
                <InputField
                  label="Email"
                  value={accountForm.email}
                  onChange={(e) => setAccountForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Email"
                  disabled
                  hint="Email update API is currently read-only for safety."
                />
                <button type="button" onClick={saveAccount} className="rounded-lg border border-indigo-400/45 bg-indigo-500/20 text-white text-sm px-4 py-2">Save</button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4">
                <InputField
                  label="Current Password"
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, current: e.target.value }))}
                />
                <InputField
                  label="New Password"
                  type="password"
                  value={passwordForm.next}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, next: e.target.value }))}
                  hint="Password and session APIs are not exposed yet; UI is ready."
                />
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="rounded-lg border border-white/20 bg-white/5 text-white text-sm px-4 py-2">Logout All Sessions</button>
                  <button type="button" className="rounded-lg border border-rose-400/45 bg-rose-500/20 text-rose-200 text-sm px-4 py-2">Delete Account</button>
                </div>
              </div>
            )}

            {activeTab === 'outreach' && (
              <div className="space-y-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#A1A1AA]">Default Send Mode</p>
                  <div className="mt-2 inline-flex rounded-lg border border-white/15 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setPrefs((prev) => ({ ...prev, defaultSendMode: 'auto' }))}
                      className={`px-3 py-1.5 text-sm ${prefs.defaultSendMode === 'auto' ? 'bg-indigo-500/25 text-white' : 'bg-transparent text-[#A1A1AA]'}`}
                    >Auto</button>
                    <button
                      type="button"
                      onClick={() => setPrefs((prev) => ({ ...prev, defaultSendMode: 'manual' }))}
                      className={`px-3 py-1.5 text-sm ${prefs.defaultSendMode === 'manual' ? 'bg-indigo-500/25 text-white' : 'bg-transparent text-[#A1A1AA]'}`}
                    >Manual</button>
                  </div>
                </div>

                <InputField
                  label="Default Test Email"
                  value={prefs.defaultTestEmail}
                  onChange={(e) => setPrefs((prev) => ({ ...prev, defaultTestEmail: e.target.value }))}
                  placeholder="you@example.com"
                />

                <ToggleSwitch
                  checked={prefs.saveHistory}
                  onChange={(checked) => setPrefs((prev) => ({ ...prev, saveHistory: checked }))}
                  label="Save history"
                />
                <ToggleSwitch
                  checked={prefs.autoSelectCompany}
                  onChange={(checked) => setPrefs((prev) => ({ ...prev, autoSelectCompany: checked }))}
                  label="Auto-select company"
                />
                <ToggleSwitch
                  checked={prefs.autoSelectContact}
                  onChange={(checked) => setPrefs((prev) => ({ ...prev, autoSelectContact: checked }))}
                  label="Auto-select contact"
                />

                <button type="button" onClick={savePrefs} className="rounded-lg border border-indigo-400/45 bg-indigo-500/20 text-white text-sm px-4 py-2">Save Preferences</button>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  { name: 'Serper', ok: Boolean(import.meta.env.VITE_SERPER_CONNECTED) },
                  { name: 'Groq', ok: Boolean(import.meta.env.VITE_GROQ_CONNECTED) },
                  { name: 'Hunter', ok: Boolean(import.meta.env.VITE_HUNTER_CONNECTED) },
                ].map((item) => (
                  <div key={item.name} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-white text-sm font-semibold">{item.name}</p>
                    <span className={`inline-flex mt-2 px-2 py-1 rounded-full text-xs border ${item.ok ? 'border-emerald-400/35 bg-emerald-500/15 text-emerald-300' : 'border-rose-400/35 bg-rose-500/15 text-rose-300'}`}>
                      {item.ok ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex flex-wrap gap-3 items-center justify-between">
                  <div>
                    <p className="text-[#A1A1AA] text-xs uppercase tracking-[0.12em]">Current Plan</p>
                    <p className="text-white font-semibold mt-1">{planLabel === 'PRO' ? 'Popular' : planLabel === 'ENTERPRISE' ? 'Custom' : 'Free'}</p>
                  </div>
                  <div>
                    <p className="text-[#A1A1AA] text-xs uppercase tracking-[0.12em]">Credits</p>
                    <p className="text-white font-semibold mt-1">{credits?.creditsRemaining || 0}/{credits?.monthlyCredits || 0}</p>
                  </div>
                  <button type="button" className="rounded-lg border border-orange-400/45 bg-orange-500/20 text-white text-sm px-4 py-2">Upgrade</button>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-white text-sm font-semibold mb-2">Payment History</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {payments.length === 0 && <p className="text-[#A1A1AA] text-sm">No payment records yet.</p>}
                    {payments.map((payment) => (
                      <div key={payment.id} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs flex items-center justify-between gap-3">
                        <div>
                          <p className="text-white font-medium">{payment.plan}</p>
                          <p className="text-[#A1A1AA]">{new Date(payment.createdAt || Date.now()).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white">₹{payment.amount}</p>
                          <p className="text-indigo-300 uppercase">{payment.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </SettingsTabs>
        </SectionWrapper>
      </div>
    </div>
  );
}
