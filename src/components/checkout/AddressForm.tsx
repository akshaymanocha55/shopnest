'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { INDIAN_STATES } from '@/constants';
import { cn } from '@/lib/utils';
import { addressSchema, type AddressForm as AddressValues } from '@/lib/validation';
import type { ShippingAddress } from '@/types/order';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface AddressFormProps {
  defaultValues: Partial<ShippingAddress>;
  onSubmit: (address: ShippingAddress) => void;
}

export function AddressForm({ defaultValues, onSubmit }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: defaultValues as Partial<AddressValues>,
    mode: 'onTouched',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5 sm:grid-cols-2">
      <Input
        label="Full name"
        autoComplete="name"
        error={errors.fullName?.message}
        {...register('fullName')}
      />
      <Input
        label="Mobile number"
        type="tel"
        inputMode="numeric"
        maxLength={10}
        leading="+91"
        autoComplete="tel-national"
        error={errors.mobile?.message}
        {...register('mobile')}
      />
      <Input
        label="Address"
        placeholder="House no., street, area"
        autoComplete="street-address"
        className="sm:col-span-2"
        error={errors.addressLine?.message}
        {...register('addressLine')}
      />
      <Input
        label="City"
        autoComplete="address-level2"
        error={errors.city?.message}
        {...register('city')}
      />
      <Input
        label="Pincode"
        inputMode="numeric"
        maxLength={6}
        autoComplete="postal-code"
        error={errors.pincode?.message}
        {...register('pincode')}
      />
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label htmlFor="state" className="text-sm font-medium text-ink-700">
          State
        </label>
        <div className="relative">
          <select
            id="state"
            defaultValue=""
            aria-invalid={Boolean(errors.state) || undefined}
            className={cn(
              'h-12 w-full cursor-pointer appearance-none rounded-xl bg-white px-4 text-[15px] ring-1 ring-mist outline-none ring-inset focus:ring-2 focus:ring-ink-700',
              errors.state && 'ring-rose-500',
            )}
            {...register('state')}
          >
            <option value="" disabled>
              Select your state
            </option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink-400" />
        </div>
        {errors.state && (
          <p role="alert" className="text-sm text-rose-600">
            {errors.state.message}
          </p>
        )}
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          Continue to payment
        </Button>
      </div>
    </form>
  );
}
