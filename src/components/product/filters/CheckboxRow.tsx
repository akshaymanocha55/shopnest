import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxRowProps {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
  type?: 'checkbox' | 'radio';
  name?: string;
}

/** Native input (keyboard + screen reader support) with a custom-drawn box. */
export function CheckboxRow({
  label,
  count,
  checked,
  onChange,
  type = 'checkbox',
  name,
}: CheckboxRowProps) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 rounded-lg py-1.5 text-[15px] text-ink-700">
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        className={cn(
          'grid size-5 shrink-0 place-items-center border-2 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-marigold-400',
          type === 'radio' ? 'rounded-full' : 'rounded-md',
          checked
            ? 'border-ink-800 bg-ink-800 text-white'
            : 'border-ink-200 bg-white group-hover:border-ink-400',
        )}
      >
        {checked && <Check className="size-3.5 animate-pop-in" strokeWidth={3.5} />}
      </span>
      <span className={cn('flex-1', checked && 'font-medium text-ink-900')}>{label}</span>
      {count != null && <span className="text-sm text-ink-400 tabular-nums">{count}</span>}
    </label>
  );
}
