import { useCallback, useEffect, useState } from 'react';

/** Seconds countdown, e.g. for "Resend OTP in 0:24". */
export function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const restart = useCallback(() => setSeconds(initialSeconds), [initialSeconds]);

  return { seconds, done: seconds <= 0, restart };
}
