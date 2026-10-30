const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const compact = new Intl.NumberFormat('en-IN', { notation: 'compact' });

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const dayFormatter = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

export const formatPrice = (amount: number) => inr.format(amount);
export const formatCount = (count: number) => compact.format(count);
export const formatDate = (iso: string) => dateFormatter.format(new Date(iso));
export const formatDay = (iso: string) => dayFormatter.format(new Date(iso));

export function maskMobile(mobile: string): string {
  return mobile.length === 10 ? `+91 ${mobile.slice(0, 2)}******${mobile.slice(-2)}` : mobile;
}
