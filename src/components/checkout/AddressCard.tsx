import { Check, MapPin, Trash2 } from 'lucide-react';
import { memo } from 'react';
import { formatAddress } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { AddressFields } from '@/types/order';

interface AddressCardProps {
  address: AddressFields;
  selected?: boolean;
  /** Renders as a radio option when provided. */
  name?: string;
  value?: string;
  onSelect?: () => void;
  onDelete?: () => void;
}

export const AddressCard = memo(function AddressCard({
  address,
  selected,
  name,
  value,
  onSelect,
  onDelete,
}: AddressCardProps) {
  const body = (
    <>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-ink-900">{address.fullName}</span>
        <span className="mt-0.5 block text-sm text-ink-600">{formatAddress(address)}</span>
        <span className="mt-0.5 block text-sm text-ink-500">{address.mobile}</span>
      </span>
      {onSelect ? (
        <span
          className={cn(
            'grid size-5 shrink-0 place-items-center rounded-full border-2 transition',
            selected ? 'border-ink-800 bg-ink-800 text-white' : 'border-ink-200',
          )}
        >
          {selected && <Check className="size-3 animate-pop-in" strokeWidth={4} />}
        </span>
      ) : (
        <MapPin className="size-5 shrink-0 text-ink-300" />
      )}
    </>
  );

  if (onSelect) {
    return (
      <label
        className={cn(
          'flex cursor-pointer items-start gap-4 rounded-2xl bg-white p-4 ring-1 transition ring-inset has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-marigold-400',
          selected ? 'ring-2 ring-ink-800' : 'ring-mist hover:ring-ink-200',
        )}
      >
        <input
          type="radio"
          name={name}
          value={value}
          checked={selected}
          onChange={onSelect}
          className="sr-only"
        />
        {body}
      </label>
    );
  }

  return (
    <div className="flex items-start gap-4 rounded-2xl bg-white p-4 ring-1 ring-mist">
      {body}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete address for ${address.fullName}`}
          className="grid size-9 shrink-0 place-items-center rounded-full text-ink-400 transition hover:bg-rose-50 hover:text-rose-600"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  );
});
