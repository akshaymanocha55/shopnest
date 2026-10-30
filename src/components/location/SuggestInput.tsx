'use client';

import { useId } from 'react';
import { Input, type InputProps } from '../ui/Input';

interface SuggestInputProps extends InputProps {
  suggestions: string[];
  loading?: boolean;
}

/**
 * Text input with native autocomplete (<datalist>) for states and cities.
 * Users can pick from the API list or type a place that is not listed.
 */
export function SuggestInput({ suggestions, loading, hint, ...props }: SuggestInputProps) {
  const listId = useId();
  return (
    <>
      <Input
        list={listId}
        autoComplete="off"
        hint={loading ? 'Loading suggestions…' : hint}
        {...props}
      />
      <datalist id={listId}>
        {suggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </>
  );
}
