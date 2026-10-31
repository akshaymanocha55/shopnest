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
  const empty = count === 0 && !checked;
  return (
    <label
      className={cn(
        'group -mx-2 flex items-center gap-3 rounded-xl px-2 py-2 text-[15px] transition-colors hover:bg-paper',
        empty ? 'text-ink-300' : 'text-ink-700',
      )}
    >
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
      <span className={cn('flex-1 leading-snug', checked && 'font-semibold text-ink-900')}>
        {label}
      </span>
      {count != null && (
        <span
          className={cn(
            'min-w-7 rounded-full px-2 py-0.5 text-center text-xs font-semibold tabular-nums',
            checked ? 'bg-ink-800 text-white' : 'bg-paper text-ink-500',
          )}
        >
          {count}
        </span>
      )}
    </label>
  );
}
