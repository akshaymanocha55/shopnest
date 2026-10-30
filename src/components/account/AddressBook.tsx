'use client';

import { MapPinned, Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { TOAST } from '@/constants';
import { generateId } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addAddress, deleteAddress, selectAddresses } from '@/store/slices/addresses.slice';
import { selectUser } from '@/store/slices/auth.slice';
import type { AddressFields } from '@/types/order';
import { AddressCard } from '../checkout/AddressCard';
import { AddressForm } from '../checkout/AddressForm';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

/** Saved addresses: add new ones or delete old ones. Used at checkout. */
export function AddressBook() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const addresses = useAppSelector(selectAddresses);
  const [adding, setAdding] = useState(false);

  const save = useCallback(
    (fields: AddressFields) => {
      dispatch(addAddress({ ...fields, id: generateId('A'), createdAt: new Date().toISOString() }));
      setAdding(false);
      toast.success(TOAST.addressSaved);
    },
    [dispatch],
  );

  return (
    <div className="space-y-4">
      {addresses.length === 0 && !adding ? (
        <EmptyState
          icon={<MapPinned />}
          title="No saved addresses"
          description="Save an address now to check out faster next time."
          action={<Button onClick={() => setAdding(true)}>Add an address</Button>}
          className="rounded-[var(--radius-card)] bg-white ring-1 ring-mist"
        />
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onDelete={() => {
                  dispatch(deleteAddress(address.id));
                  toast(TOAST.addressDeleted);
                }}
              />
            ))}
          </div>
          {adding ? (
            <div className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-mist">
              <h2 className="mb-5 text-xl font-bold text-ink-900">New address</h2>
              <AddressForm
                idPrefix="account-address"
                defaultValues={{ fullName: user?.name, mobile: user?.mobile }}
                submitLabel="Save address"
                onSubmit={save}
                onCancel={() => setAdding(false)}
              />
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setAdding(true)}>
              <Plus className="size-4" /> Add a new address
            </Button>
          )}
        </>
      )}
    </div>
  );
}
