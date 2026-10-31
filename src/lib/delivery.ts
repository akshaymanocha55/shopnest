import {
  DELIVERY_DAYS,
  METRO_PREFIXES,
  REMOTE_PREFIXES,
  UNSERVICEABLE_FIRST_DIGIT,
} from '@/constants';

export type DeliveryZone = 'metro' | 'standard' | 'remote';

export interface DeliveryRule {
  deliverable: boolean;
  zone: DeliveryZone | null;
  days: number | null;
  /** City name when the pincode is a known metro. */
  metroName?: string;
}

export const isValidPincode = (value: string) => /^[1-9]\d{5}$/.test(value);

/** Delivery days for an Indian pincode, from the rule table in constants/delivery.ts. */
export function getDeliveryRule(pincode: string): DeliveryRule {
  if (!isValidPincode(pincode) || pincode.startsWith(UNSERVICEABLE_FIRST_DIGIT)) {
    return { deliverable: false, zone: null, days: null };
  }
  const metroName = METRO_PREFIXES[pincode.slice(0, 3)];
  if (metroName) return { deliverable: true, zone: 'metro', days: DELIVERY_DAYS.metro, metroName };
  if (REMOTE_PREFIXES.includes(pincode.slice(0, 2))) {
    return { deliverable: true, zone: 'remote', days: DELIVERY_DAYS.remote };
  }
  return { deliverable: true, zone: 'standard', days: DELIVERY_DAYS.standard };
}

/** "Mon, 2 Nov" style date `days` from `from`. */
export function addDays(from: Date, days: number): Date {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  return date;
}
