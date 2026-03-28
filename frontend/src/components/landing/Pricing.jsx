import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock3, Flame, QrCode, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  createDemoPaymentSession,
  getDemoPaymentStatus,
  updateAccountPlan,
} from '../../services/api';

const plans = [
  {
    name: 'Start Free',
    planKey: 'FREE',
    monthly: 0,
    yearly: 0,
    desc: 'Perfect for solo founders testing AI outreach.',
    features: ['30 Monthly Credits', 'Auto + Manual Modes', 'Live Streaming UX', 'Basic Signal Analysis', 'Email Support'],
    popular: false,
  },
  {
    name: 'Popular',
    planKey: 'PRO',
    monthly: 599,
    yearly: 479,
    desc: 'For growing teams scaling B2B outreach.',
    features: ['2000 Monthly Credits', 'All 6 Signal Types (S1–S6)', 'PDF Intelligence Layer', 'Gold Highlight System', 'Priority Support', 'Custom ICP Templates'],
    popular: true,
  },
  {
    name: 'Custom',
    planKey: 'ENTERPRISE',
    monthly: 999,
    yearly: 799,
    desc: 'Custom solutions for large-scale outreach operations.',
    features: ['9999 Monthly Credits', 'Everything in Pro', 'Dedicated Agent Strategist', 'CRM Integration (HubSpot)', 'Custom Pitch PDFs', 'SLA + Onboarding'],
    popular: false,
  },
];

const SESSION_KEY = 'firereach_session';

const getSession = () => {
  try {
    return JSON.parse(window.localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
};

const planRank = {
  FREE: 1,
  PRO: 2,
  ENTERPRISE: 3,
};

const formatCountdown = (expiresAt) => {
  const targetMs = Number(expiresAt) || new Date(expiresAt).getTime();
  if (!Number.isFinite(targetMs)) {
    return '05:00';
  }
  const diff = Math.max(0, targetMs - Date.now());
  const seconds = Math.floor(diff / 1000);
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

export default function Pricing() {
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(false);
  const [session, setSession] = useState(() => getSession());
  const [selectedPlan, setSelectedPlan] = useState(() => String(getSession()?.user?.plan || 'FREE').toUpperCase());
  const [burstSeed, setBurstSeed] = useState(0);
  const [busyPlan, setBusyPlan] = useState('');
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentCountdown, setPaymentCountdown] = useState('05:00');
  const [paymentError, setPaymentError] = useState('');

  const sessionToken = session?.token || '';
  const currentPlan = String(session?.user?.plan || 'FREE').toUpperCase();

  useEffect(() => {
    const sync = () => {
      const next = getSession();
      setSession(next);
      setSelectedPlan(String(next?.user?.plan || 'FREE').toUpperCase());
    };

    window.addEventListener('storage', sync);
    window.addEventListener('firereach-session-updated', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('firereach-session-updated', sync);
    };
  }, []);

  const paymentQrSrc = useMemo(() => {
    if (!paymentModal?.paymentUrl) {
      return '';
    }
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(paymentModal.paymentUrl)}`;
  }, [paymentModal?.paymentUrl]);

  useEffect(() => {
    if (!paymentModal?.expiresAt || paymentModal?.status !== 'pending') {
      return;
    }

    const timer = window.setInterval(() => {
      const next = formatCountdown(paymentModal.expiresAt);
      setPaymentCountdown(next);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [paymentModal?.expiresAt, paymentModal?.status]);

  useEffect(() => {
    if (!paymentModal?.paymentSessionId || paymentModal?.status !== 'pending' || !sessionToken) {
      return;
    }

    const poll = window.setInterval(async () => {
      try {
        const status = await getDemoPaymentStatus(sessionToken, paymentModal.paymentSessionId);
        if (status?.status === 'paid' && status?.user) {
          const nextSession = {
            ...(getSession() || {}),
            token: sessionToken,
            user: status.user,
          };
          window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
          window.localStorage.setItem('firereach_user', JSON.stringify(status.user));
          window.dispatchEvent(new Event('firereach-session-updated'));
          setSelectedPlan(String(status.user.plan || 'FREE').toUpperCase());
          setPaymentModal((prev) => prev ? { ...prev, status: 'paid' } : prev);
        }
        if (status?.status === 'expired') {
          setPaymentModal((prev) => prev ? { ...prev, status: 'expired' } : prev);
        }
      } catch {
        // Keep polling silently for demo flow.
      }
    }, 2000);

    return () => window.clearInterval(poll);
  }, [paymentModal?.paymentSessionId, paymentModal?.status, sessionToken]);

  const handlePlanSelect = async (planKey) => {
    setPaymentError('');
    setSelectedPlan(planKey);

    if (!sessionToken) {
      navigate('/auth?mode=login');
      return;
    }

    const currentRank = planRank[currentPlan] || 1;
    const targetRank = planRank[planKey] || 1;

    if (targetRank > currentRank) {
      if (!['PRO', 'ENTERPRISE'].includes(planKey)) {
        return;
      }
      setBusyPlan(planKey);
      try {
        const payment = await createDemoPaymentSession(sessionToken, planKey);
        setPaymentModal({
          ...payment,
          status: 'pending',
        });
        setPaymentCountdown(formatCountdown(payment.expiresAt));
      } catch (error) {
        if (error?.response?.status === 401) {
          window.localStorage.removeItem(SESSION_KEY);
          window.localStorage.removeItem('firereach_user');
          window.dispatchEvent(new Event('firereach-session-updated'));
          navigate('/auth?mode=login');
          return;
        }
        setPaymentError(error?.response?.data?.message || 'Unable to create demo payment.');
      } finally {
        setBusyPlan('');
      }
      return;
    }

    setBusyPlan(planKey);
    try {
      const response = await updateAccountPlan(sessionToken, planKey);
      const nextSession = {
        ...(getSession() || {}),
        token: sessionToken,
        user: response.user,
      };
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      window.localStorage.setItem('firereach_user', JSON.stringify(response.user));
      window.dispatchEvent(new Event('firereach-session-updated'));
    } catch (error) {
      if (error?.response?.status === 401) {
        window.localStorage.removeItem(SESSION_KEY);
        window.localStorage.removeItem('firereach_user');
        window.dispatchEvent(new Event('firereach-session-updated'));
        navigate('/auth?mode=login');
        return;
      }
      setPaymentError(error?.response?.data?.message || 'Plan update failed.');
      // Keep selection state even if account sync fails.
    } finally {
      setBusyPlan('');
    }
  };

  const handleBillingToggle = (isYearly) => {
    setYearly(isYearly);
    if (isYearly) {
      setBurstSeed((prev) => prev + 1);
    }
  };

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-indigo-400 text-xs font-semibold tracking-widest uppercase mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Simple, Transparent <span className="italic font-serif text-white/80">Pricing</span>
          </h2>
          <p className="text-[#A1A1AA] text-base max-w-lg mx-auto leading-relaxed font-light mb-8">
            Start free. Scale as you grow. No hidden fees.
          </p>

          {/* Toggle */}
          <div className="relative inline-flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-full px-1.5 py-1.5">
            <button
              onClick={() => handleBillingToggle(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all border-none cursor-pointer ${!yearly ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'text-[#A1A1AA] bg-transparent hover:text-white'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => handleBillingToggle(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all border-none cursor-pointer ${yearly ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'text-[#A1A1AA] bg-transparent hover:text-white'}`}
            >
              Yearly
            </button>
            {yearly && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/25 font-semibold">
                Save 20%
              </span>
            )}

            {yearly && (
              <div key={burstSeed} className="pointer-events-none absolute inset-0">
                {Array.from({ length: 14 }).map((_, i) => {
                  const x = (Math.random() - 0.5) * 220;
                  const y = -40 - Math.random() * 100;
                  return (
                    <motion.span
                      key={`${burstSeed}-${i}`}
                      className="absolute left-1/2 top-1/2 text-sm"
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      animate={{ x, y, opacity: 0, scale: 1.2 }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                    >
                      ✨
                    </motion.span>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {plans.map((p) => (
            <div
              key={p.name}
              onClick={() => setSelectedPlan(p.planKey)}
              className={`landing-card-hover relative bg-white/[0.03] backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 ${
                p.planKey === selectedPlan
                  ? 'border-indigo-400/65 shadow-[0_0_0_1px_rgba(129,140,248,0.55),0_0_35px_rgba(99,102,241,0.45)]'
                  : 'border-white/[0.06] hover:border-white/[0.18] hover:shadow-[0_0_24px_rgba(99,102,241,0.2)]'
              } cursor-pointer`}
            >
              {p.planKey === 'PRO' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-semibold shadow-lg">
                  <Flame className="w-3 h-3" /> Popular
                </div>
              )}

              <h3 className="text-white font-semibold text-lg mb-1">{p.name}</h3>
              <p className="text-[#A1A1AA] text-xs mb-5 font-light">{p.desc}</p>

              <div className="mb-6">
                {p.planKey === 'FREE' ? (
                  <span className="text-2xl font-bold text-white">Free</span>
                ) : p.monthly !== null ? (
                  <>
                    <span className="text-4xl font-bold text-white">₹{yearly ? p.yearly : p.monthly}</span>
                    <span className="text-[#A1A1AA] text-sm ml-1">/mo</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-white">Custom</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#A1A1AA]">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${p.popular ? 'text-indigo-400' : 'text-green-400'}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handlePlanSelect(p.planKey);
                }}
                className={`w-full py-3 rounded-lg text-sm font-semibold transition-all border-none cursor-pointer ${
                  p.planKey === selectedPlan
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 shadow-lg shadow-indigo-500/20'
                    : 'bg-white/[0.06] text-white border border-white/[0.1] hover:bg-white/[0.1]'
                }`}
                disabled={busyPlan === p.planKey}
              >
                {busyPlan === p.planKey
                  ? 'Please wait...'
                  : p.planKey === 'FREE'
                    ? 'Start Free Trial'
                    : 'Get Started'}
              </button>
            </div>
          ))}
        </motion.div>
        {paymentError && (
          <div className="mt-4 text-sm text-rose-300 text-center">{paymentError}</div>
        )}

        {paymentModal && (
          <div
            className="fixed inset-0 z-[2200] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => {
              if (paymentModal.status !== 'pending') {
                setPaymentModal(null);
              }
            }}
          >
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b0b12] p-5" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="text-xs text-indigo-300 tracking-[0.18em] uppercase">Demo Payment</div>
                  <h3 className="text-white text-xl font-semibold mt-1">
                    {paymentModal.plan === 'PRO' ? 'Popular Plan Checkout' : 'Custom Plan Checkout'}
                  </h3>
                  <p className="text-sm text-[#A1A1AA] mt-1">
                    Name: <span className="text-white">{paymentModal.userName}</span> | Amount: <span className="text-white">₹{paymentModal.amount}</span>
                  </p>
                </div>
                <button className="bg-transparent border-none text-white cursor-pointer" type="button" onClick={() => setPaymentModal(null)}>
                  <XCircle size={18} />
                </button>
              </div>

              {paymentModal.status === 'pending' && (
                <>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col items-center">
                    <img src={paymentQrSrc} alt="Demo payment QR" className="w-56 h-56 rounded-lg bg-white p-2" />
                    <div className="mt-3 flex items-center gap-2 text-sm text-[#A1A1AA]">
                      <QrCode size={14} /> Scan QR from phone to open payment page
                    </div>
                    <a href={paymentModal.paymentUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-300 mt-2">
                      Open Payment Page
                    </a>
                    <div className="mt-2 flex items-center gap-2 text-sm text-amber-300">
                      <Clock3 size={14} /> Valid for {paymentCountdown}
                    </div>
                  </div>
                  <p className="text-xs text-[#A1A1AA] mt-3">
                    On the phone payment page, enter any 6-digit number and submit. After a successful submit, your plan is upgraded automatically.
                  </p>
                </>
              )}

              {paymentModal.status === 'paid' && (
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-emerald-300 text-sm">
                  Payment successful. Plan upgraded and credits added.
                </div>
              )}

              {paymentModal.status === 'expired' && (
                <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-rose-300 text-sm">
                  Payment session expired. Please create a new QR from pricing.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
