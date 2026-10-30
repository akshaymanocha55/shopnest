'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { TOAST } from '@/constants';
import { generateId } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addAddress, selectAddresses } from '@/store/slices/addresses.slice';
import { selectUser } from '@/store/slices/auth.slice';
import type { AddressFields } from '@/types/order';
import { CheckboxRow } from '../product/filters/CheckboxRow';
import { Button } from '../ui/Button';
import { AddressPicker } from './AddressPicker';

export interface AddressSelection {
  shippingId: string;
  billingId: string;
  billingSameAsShipping: boolean;
}

interface AddressStepProps {
  initial: AddressSelection | null;
  onContinue: (selection: AddressSelection) => void;
}

/** Shipping + billing address selection. New addresses are saved to the user's address book. */
export function AddressStep({ initial, onContinue }: AddressStepProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const addresses = useAppSelector(selectAddresses);

  const [shippingId, setShippingId] = useState<string | null>(
    initial?.shippingId ?? addresses[0]?.id ?? null,
  );
  const [billingId, setBillingId] = useState<string | null>(initial?.billingId ?? null);
  const [sameAsShipping, setSameAsShipping] = useState(initial?.billingSameAsShipping ?? true);

  const save = useCallback(
    (fields: AddressFields) => {
      const id = generateId('A');
      dispatch(addAddress({ ...fields, id, createdAt: new Date().toISOString() }));
      toast.success(TOAST.addressSaved);
      return id;
    },
    [dispatch],
  );

  const resolvedBilling = sameAsShipping ? shippingId : billingId;
  const canContinue = Boolean(shippingId && resolvedBilling);
  const prefill = { fullName: user?.name, mobile: user?.mobile };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-sans text-base font-semibold text-ink-900">Shipping address</h3>
        <AddressPicker
          idPrefix="shipping"
          addresses={addresses}
          selectedId={shippingId}
          onSelect={setShippingId}
          onAdd={(fields) => setShippingId(save(fields))}
          defaultValues={prefill}
        />
      </div>

      <div className="rounded-2xl bg-paper px-4 py-2">
        <CheckboxRow
          label="Billing address is the same as shipping address"
          checked={sameAsShipping}
          onChange={() => setSameAsShipping((v) => !v)}
        />
      </div>

      {!sameAsShipping && (
        <div className="animate-fade-in">
          <h3 className="mb-3 font-sans text-base font-semibold text-ink-900">Billing address</h3>
          <AddressPicker
            idPrefix="billing"
            addresses={addresses}
            selectedId={billingId}
            onSelect={setBillingId}
            onAdd={(fields) => setBillingId(save(fields))}
            defaultValues={prefill}
          />
        </div>
      )}

      <Button
        size="lg"
        disabled={!canContinue}
        className="w-full sm:w-auto"
        onClick={() =>
          canContinue &&
          onContinue({
            shippingId: shippingId!,
            billingId: resolvedBilling!,
            billingSameAsShipping: sameAsShipping,
          })
        }
      >
        Continue to payment
      </Button>
      {!canContinue && (
        <p className="text-sm text-ink-500">
          {shippingId
            ? 'Select or add a billing address to continue.'
            : 'Add a shipping address to continue.'}
        </p>
      )}
    </div>
  );
}
