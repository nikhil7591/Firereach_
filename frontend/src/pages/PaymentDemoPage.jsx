import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getDemoPaymentSession, submitDemoPayment } from '../services/api';
import './PaymentDemoPage.css';

const PAYMENT_SYNC_KEY = 'firereach_payment_sync';

function formatCountdown(expiresAt) {
  const diff = Math.max(0, new Date(expiresAt).getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function PaymentDemoPage() {
  const { sessionId = '' } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentCode, setPaymentCode] = useState('');
  const [payment, setPayment] = useState(null);
  const [countdown, setCountdown] = useState('00:00');
  const [closeCountdown, setCloseCountdown] = useState(15);

  useEffect(() => {
    let mounted = true;

    const loadPayment = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getDemoPaymentSession(sessionId);
        if (mounted) {
          setPayment(response);
          setCountdown(formatCountdown(response.expiresAt));
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError?.response?.data?.message || 'Unable to load payment session.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (sessionId) {
      loadPayment();
    } else {
      setLoading(false);
      setError('Invalid payment session.');
    }

    return () => {
      mounted = false;
    };
  }, [sessionId]);

  useEffect(() => {
    if (!payment?.expiresAt || payment?.status !== 'pending') {
      return;
    }

    const timer = window.setInterval(() => {
      const next = formatCountdown(payment.expiresAt);
      setCountdown(next);
      if (next === '00:00') {
        setPayment((prev) => prev ? { ...prev, status: 'expired' } : prev);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [payment?.expiresAt, payment?.status]);

  useEffect(() => {
    if (payment?.status !== 'paid') {
      return;
    }

    const planLabel = payment?.plan === 'PRO' ? 'Popular' : payment?.plan === 'ENTERPRISE' ? 'Custom' : 'Free';
    const payload = {
      type: 'firereach-payment-success',
      sessionId,
      plan: payment?.plan,
      planLabel,
      at: Date.now(),
    };

    try {
      window.localStorage.setItem(PAYMENT_SYNC_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage issues.
    }

    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage(payload, window.location.origin);
      } catch {
        // Ignore cross-window messaging failures.
      }
    }

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(740, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1120, audioContext.currentTime + 0.16);
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.14, audioContext.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.34);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.35);
      window.setTimeout(() => {
        audioContext.close().catch(() => {});
      }, 500);
    } catch {
      // Ignore browsers that block autoplay audio.
    }

    setCloseCountdown(15);
    let remaining = 15;

    const tick = window.setInterval(() => {
      remaining -= 1;
      setCloseCountdown(Math.max(remaining, 0));
      if (remaining <= 0) {
        window.clearInterval(tick);
        if (window.opener && !window.opener.closed) {
          window.close();
          return;
        }
        window.location.assign('/?payment=success');
      }
    }, 1000);

    return () => window.clearInterval(tick);
  }, [payment?.plan, payment?.status, sessionId]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (!/^\d{6}$/.test(paymentCode.trim())) {
      setError('Enter any 6 digit demo code.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitDemoPayment(sessionId, paymentCode.trim());
      setPayment((prev) => ({
        ...(prev || {}),
        status: response.status || 'paid',
      }));
      setPaymentCode('');
    } catch (submitError) {
      setError(submitError?.response?.data?.message || 'Payment submit failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const title = useMemo(() => {
    if (payment?.status === 'paid') {
      return 'Payment Successful';
    }
    if (payment?.status === 'expired') {
      return 'Session Expired';
    }
    return 'Demo Payment Gateway';
  }, [payment?.status]);

  return (
    <div className="payment-demo-page">
      <div className="payment-demo-card">
        <div className="payment-demo-kicker">FireReach Secure Pay</div>
        <h1>{title}</h1>

        {loading && <p className="payment-demo-muted">Loading payment session...</p>}

        {!loading && error && <p className="payment-demo-error">{error}</p>}

        {!loading && !error && payment && (
          <>
            <div className="payment-demo-summary">
              <div><span>Name</span><strong>{payment.userName}</strong></div>
              <div><span>Plan</span><strong>{payment.plan === 'PRO' ? 'Popular' : 'Custom'}</strong></div>
              <div><span>Amount</span><strong>₹{payment.amount}</strong></div>
              <div><span>Expires In</span><strong>{payment.status === 'pending' ? countdown : '00:00'}</strong></div>
            </div>

            {payment.status === 'pending' && (
              <form className="payment-demo-form" onSubmit={submit}>
                <label>
                  Enter Any 6 Digit Number
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={paymentCode}
                    onChange={(event) => setPaymentCode(event.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                  />
                </label>
                <button type="submit" disabled={submitting}>
                  {submitting ? 'Processing...' : 'Submit Payment'}
                </button>
              </form>
            )}

            {payment.status === 'paid' && (
              <div className="payment-demo-success-wrap" role="status" aria-live="polite">
                <div className="payment-demo-success-icon" aria-hidden="true">
                  <span>✓</span>
                </div>
                <p className="payment-demo-success-title">Payment Successful</p>
                <p className="payment-demo-success">
                  Payment successful, now you are in {payment.plan === 'PRO' ? 'Popular' : payment.plan === 'ENTERPRISE' ? 'Custom' : 'Free'} plan.
                </p>
                <p className="payment-demo-muted">This page will auto-close in {closeCountdown}s.</p>
              </div>
            )}

            {payment.status === 'expired' && (
              <p className="payment-demo-error">This payment session has expired. Please generate a new QR from pricing.</p>
            )}
          </>
        )}

        <Link to="/" className="payment-demo-back">Back To Home</Link>
      </div>
    </div>
  );
}
