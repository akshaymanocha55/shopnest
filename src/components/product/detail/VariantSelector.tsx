'use client';

import { memo } from 'react';
import { formatPrice } from '@/lib/format';
import type { SelectedVariants } from '@/types/cart';
import type { VariantGroup } from '@/types/product';
import { Chip } from '../../ui/Chip';

interface VariantSelectorProps {
  groups: VariantGroup[];
  selected: SelectedVariants;
  onSelect: (groupId: string, optionId: string) => void;
}

export const VariantSelector = memo(function VariantSelector({
  groups,
  selected,
  onSelect,
}: VariantSelectorProps) {
  return (
    <div className="space-y-5">
      {groups.map((group) => {
        const current = group.options.find((o) => o.id === selected[group.id]);
        return (
          <fieldset key={group.id}>
            <legend className="mb-2.5 text-sm text-ink-500">
              {group.name}:{' '}
              <span className="font-semibold text-ink-900">{current?.label ?? 'Select'}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {group.options.map((option) => (
                <Chip
                  key={option.id}
                  selected={selected[group.id] === option.id}
                  disabled={!option.inStock}
                  onClick={() => onSelect(group.id, option.id)}
                  aria-label={`${option.label}${option.inStock ? '' : ', out of stock'}`}
                  className="min-w-12"
                >
                  {option.label}
                  {option.priceDelta !== 0 && (
                    <span className="text-xs opacity-70">
                      {option.priceDelta > 0 ? '+' : '−'}
                      {formatPrice(Math.abs(option.priceDelta))}
                    </span>
                  )}
                </Chip>
              ))}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
});
