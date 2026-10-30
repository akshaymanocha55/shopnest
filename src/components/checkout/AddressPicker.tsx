'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { Address, AddressFields } from '@/types/order';
import { AddressCard } from './AddressCard';
import { AddressForm } from './AddressForm';

interface AddressPickerProps {
  /** Used for radio group names and form input ids. */
  idPrefix: string;
  addresses: Address[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Save a new address to the address book and select it. */
  onAdd: (address: AddressFields) => void;
  defaultValues?: Partial<AddressFields>;
}

/**
 * Existing customers pick from saved addresses (or add another);
 * new customers with no saved address see the form straight away.
 */
export function AddressPicker({
  idPrefix,
  addresses,
  selectedId,
  onSelect,
  onAdd,
  defaultValues,
}: AddressPickerProps) {
  const [adding, setAdding] = useState(false);
  const showForm = adding || addresses.length === 0;

  return (
    <div className="space-y-3">
      {addresses.length > 0 && (
        <div role="radiogroup" aria-label="Saved addresses" className="grid gap-3">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              name={`${idPrefix}-address`}
              value={address.id}
              selected={selectedId === address.id}
              onSelect={() => onSelect(address.id)}
            />
          ))}
        </div>
      )}

      {showForm ? (
        <div className={addresses.length > 0 ? 'rounded-2xl bg-paper p-5' : undefined}>
          {addresses.length > 0 && <p className="mb-4 font-semibold text-ink-900">New address</p>}
          <AddressForm
            idPrefix={idPrefix}
            defaultValues={defaultValues}
            submitLabel="Save address"
            onSubmit={(address) => {
              onAdd(address);
              setAdding(false);
            }}
            onCancel={addresses.length > 0 ? () => setAdding(false) : undefined}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-mist py-4 text-sm font-semibold text-ink-600 transition hover:border-ink-300 hover:text-ink-900"
        >
          <Plus className="size-4" /> Add a new address
        </button>
      )}
    </div>
  );
}
