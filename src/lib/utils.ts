import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes without conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .slice(0, 60)
    .replace(/-$/, '');
}

/** Product slugs end with the id, e.g. "mens-cotton-jacket-3". */
export function productIdFromSlug(slug: string): number | null {
  const id = Number(slug.split('-').pop());
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function generateId(prefix = ''): string {
  const random = crypto.getRandomValues(new Uint32Array(2));
  return `${prefix}${Date.now().toString(36)}${random[0].toString(36)}${random[1].toString(36)}`.toUpperCase();
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function truncate(text: string, length: number): string {
  return text.length > length ? `${text.slice(0, length - 1).trimEnd()}…` : text;
}

export function toTitleCase(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

export const isBrowser = () => typeof window !== 'undefined';
