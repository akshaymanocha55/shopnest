'use client';

import { useState, type FormEvent } from 'react';
import { MOCK_OTP, OTP_RESEND_SECONDS } from '@/constants';
import { useCountdown } from '@/hooks/useCountdown';
import { maskMobile } from '@/lib/format';
import { otpSchema } from '@/lib/validation';
import { Button } from '../ui/Button';
import { OtpInput } from '../ui/OtpInput';

interface OtpStepProps {
  mobile: string;
  submitLabel: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onChangeNumber: () => void;
}

/** Shared OTP screen for login and signup: 6-box input, resend timer, inline errors. */
export function OtpStep({ mobile, submitLabel, onVerify, onResend, onChangeNumber }: OtpStepProps) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string>();
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const { seconds, done, restart } = useCountdown(OTP_RESEND_SECONDS);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = otpSchema.safeParse(otp);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError(undefined);
    setVerifying(true);
    try {
      await onVerify(otp);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setOtp('');
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await onResend();
      restart();
      setOtp('');
      setError(undefined);
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="animate-fade-in space-y-6">
      <p className="text-sm text-ink-600">
        Enter the 6-digit code sent to{' '}
        <span className="font-semibold text-ink-900">{maskMobile(mobile)}</span>.{' '}
        <button
          type="button"
          onClick={onChangeNumber}
          className="font-semibold text-ink-800 underline underline-offset-4"
        >
          Change number
        </button>
      </p>

      <OtpInput value={otp} onChange={setOtp} error={error} disabled={verifying} autoFocus />

      <p className="rounded-xl bg-marigold-50 px-4 py-3 text-sm text-ink-700">
        Demo store: the code is always <span className="font-bold tracking-wider">{MOCK_OTP}</span>.
      </p>

      <Button type="submit" size="lg" fullWidth loading={verifying}>
        {submitLabel}
      </Button>

      <p className="text-center text-sm text-ink-500">
        {done ? (
          <button
            type="button"
            onClick={resend}
            disabled={resending}
            className="font-semibold text-ink-800 underline underline-offset-4 disabled:opacity-50"
          >
            {resending ? 'Sending…' : 'Resend code'}
          </button>
        ) : (
          <>Resend code in 0:{seconds.toString().padStart(2, '0')}</>
        )}
      </p>
    </form>
  );
}
