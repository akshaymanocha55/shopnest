'use client';

import { Bell, BellRing } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { TOAST } from '@/constants';
import { Button, type ButtonProps } from '../ui/Button';

/** Shown instead of "Add to cart" when a product is sold out. */
export function NotifyMeButton({
  size = 'md',
  className,
  fullWidth,
}: Pick<ButtonProps, 'size' | 'className' | 'fullWidth'>) {
  const [subscribed, setSubscribed] = useState(false);
  return (
    <Button
      variant="secondary"
      size={size}
      fullWidth={fullWidth}
      className={className}
      disabled={subscribed}
      onClick={() => {
        setSubscribed(true);
        toast.success(TOAST.notifyMe);
      }}
    >
      {subscribed ? <BellRing className="size-4" /> : <Bell className="size-4" />}
      {subscribed ? 'We’ll notify you' : 'Notify me'}
    </Button>
  );
}
