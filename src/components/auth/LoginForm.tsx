'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { REDIRECT_PARAM, ROUTES, TOAST } from '@/constants';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { getErrorMessage, isApiError } from '@/lib/errors';
import { maskMobile } from '@/lib/format';
import { loginSchema, type LoginForm as LoginValues } from '@/lib/validation';
import { authService } from '@/services/auth.service';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { OtpStep } from './OtpStep';

export function LoginForm() {
  const searchParams = useSearchParams();
  const finishAuth = useAuthRedirect();
  const [mobile, setMobile] = useState<string | null>(null);
  const redirect = searchParams.get(REDIRECT_PARAM);
  const signupHref = redirect
    ? `${ROUTES.signup}?${REDIRECT_PARAM}=${encodeURIComponent(redirect)}`
    : ROUTES.signup;

  // react-hook-form keeps inputs uncontrolled, so typing does not re-render the form.
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), mode: 'onTouched' });

  const requestOtp = async ({ mobile: value }: LoginValues) => {
    try {
      await authService.requestLoginOtp(value);
      toast.success(TOAST.otpSent(maskMobile(value)));
      setMobile(value);
    } catch (error) {
      if (isApiError(error) && error.code === 'NOT_FOUND')
        setError('mobile', { message: getErrorMessage(error) });
      else toast.error(getErrorMessage(error));
    }
  };

  if (mobile) {
    return (
      <OtpStep
        mobile={mobile}
        submitLabel="Verify and log in"
        onVerify={async (otp) => {
          const user = await authService.login(mobile, otp);
          await finishAuth(user, TOAST.loginSuccess(user.name.split(' ')[0]));
        }}
        onResend={async () => {
          await authService.requestLoginOtp(mobile);
          toast.success(TOAST.otpSent(maskMobile(mobile)));
        }}
        onChangeNumber={() => setMobile(null)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(requestOtp)} noValidate className="space-y-6">
      <Input
        label="Mobile number"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        maxLength={10}
        placeholder="98765 43210"
        leading="+91"
        error={errors.mobile?.message}
        {...register('mobile')}
      />
      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        Send OTP
      </Button>
      <p className="text-center text-sm text-ink-500">
        New to ShopNest?{' '}
        <Link href={signupHref} className="font-semibold text-ink-800 underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </form>
  );
}
