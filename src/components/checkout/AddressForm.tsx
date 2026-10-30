'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { addressSchema, type AddressForm as AddressValues } from '@/lib/validation';
import { locationQueries } from '@/services/queries/location.queries';
import type { AddressFields } from '@/types/order';
import { CountrySelect } from '../location/CountrySelect';
import { SuggestInput } from '../location/SuggestInput';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface AddressFormProps {
  /** Prefix for input ids so two forms can be on the page at once (shipping + billing). */
  idPrefix: string;
  defaultValues?: Partial<AddressFields>;
  submitLabel: string;
  onSubmit: (address: AddressFields) => void;
  onCancel?: () => void;
}

const EMPTY: AddressFields = {
  fullName: '',
  mobile: '',
  addressLine: '',
  country: 'India',
  state: '',
  city: '',
  postalCode: '',
};

/** Address form with country (API), state and city (API suggestions) and country-aware validation. */
export function AddressForm({
  idPrefix,
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
}: AddressFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { ...EMPTY, ...defaultValues },
    mode: 'onTouched',
  });

  // useWatch re-renders only this form, and only when the country changes.
  const country = useWatch({ control, name: 'country' });
  const isIndia = country === 'India';
  const { data: states = [], isFetching: loadingStates } = useQuery(
    locationQueries.states(country),
  );
  const { data: cities = [], isFetching: loadingCities } = useQuery(
    locationQueries.cities(country),
  );
  const id = (name: string) => `${idPrefix}-${name}`;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="grid animate-fade-in gap-5 sm:grid-cols-2"
    >
      <Input
        id={id('fullName')}
        label="Full name"
        autoComplete="name"
        error={errors.fullName?.message}
        {...register('fullName')}
      />
      <Input
        id={id('mobile')}
        label="Mobile number"
        type="tel"
        inputMode="tel"
        maxLength={15}
        leading={isIndia ? '+91' : undefined}
        autoComplete="tel"
        error={errors.mobile?.message}
        {...register('mobile')}
      />
      <Input
        id={id('addressLine')}
        label="Address"
        placeholder="House no., street, area, landmark"
        autoComplete="street-address"
        className="sm:col-span-2"
        error={errors.addressLine?.message}
        {...register('addressLine')}
      />
      <Controller
        control={control}
        name="country"
        render={({ field }) => (
          <CountrySelect
            id={id('country')}
            label="Country"
            autoComplete="country-name"
            error={errors.country?.message}
            value={field.value}
            onBlur={field.onBlur}
            onChange={(event) => {
              field.onChange(event.target.value);
              // State and city lists depend on the country, so reset them.
              setValue('state', '');
              setValue('city', '');
            }}
          />
        )}
      />
      <SuggestInput
        id={id('state')}
        label="State"
        autoComplete="address-level1"
        suggestions={states}
        loading={loadingStates}
        error={errors.state?.message}
        {...register('state')}
      />
      <SuggestInput
        id={id('city')}
        label="City"
        autoComplete="address-level2"
        suggestions={cities}
        loading={loadingCities}
        error={errors.city?.message}
        {...register('city')}
      />
      <Input
        id={id('postalCode')}
        label={isIndia ? 'Pincode' : 'Postal code'}
        inputMode={isIndia ? 'numeric' : 'text'}
        maxLength={10}
        autoComplete="postal-code"
        error={errors.postalCode?.message}
        {...register('postalCode')}
      />
      <div className="flex flex-wrap gap-3 sm:col-span-2">
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
