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
import { signupSchema, type SignupForm as SignupValues } from '@/lib/validation';
import { authService } from '@/services/auth.service';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { OtpStep } from './OtpStep';

export function SignupForm() {
  const searchParams = useSearchParams();
  const finishAuth = useAuthRedirect();
  const [details, setDetails] = useState<SignupValues | null>(null);
  const redirect = searchParams.get(REDIRECT_PARAM);
  const loginHref = redirect
    ? `${ROUTES.login}?${REDIRECT_PARAM}=${encodeURIComponent(redirect)}`
    : ROUTES.login;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema), mode: 'onTouched' });

  const requestOtp = async (values: SignupValues) => {
    try {
      await authService.requestSignupOtp(values);
      toast.success(TOAST.otpSent(maskMobile(values.mobile)));
      setDetails(values);
    } catch (error) {
      if (isApiError(error) && error.code === 'VALIDATION')
        setError('mobile', { message: getErrorMessage(error) });
      else toast.error(getErrorMessage(error));
    }
  };

  if (details) {
    return (
      <OtpStep
        mobile={details.mobile}
        submitLabel="Verify and create account"
        onVerify={async (otp) => {
          const user = await authService.signup(details, otp);
          await finishAuth(user, TOAST.signupSuccess(user.name.split(' ')[0]));
        }}
        onResend={async () => {
          toast.success(TOAST.otpSent(maskMobile(details.mobile)));
        }}
        onChangeNumber={() => setDetails(null)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(requestOtp)} noValidate className="space-y-5">
      <Input
        label="Full name"
        autoComplete="name"
        placeholder="Akshay Kumar"
        error={errors.name?.message}
        {...register('name')}
      />
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
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        hint="We send order updates here"
        error={errors.email?.message}
        {...register('email')}
      />
      <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="mt-2">
        Send OTP
      </Button>
      <p className="text-center text-sm text-ink-500">
        Already have an account?{' '}
        <Link href={loginHref} className="font-semibold text-ink-800 underline underline-offset-4">
          Log in
        </Link>
      </p>
    </form>
  );
}
