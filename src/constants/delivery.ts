/**
 * Delivery-time rules by Indian pincode. A real store gets this from its logistics partner;
 * here it is a small rule table so the estimate changes realistically with the pincode.
 */

/** Metro pincode prefixes served from a local warehouse: fastest delivery. */
export const METRO_PREFIXES: Record<string, string> = {
  '110': 'Delhi',
  '122': 'Gurugram',
  '201': 'Noida / Ghaziabad',
  '400': 'Mumbai',
  '411': 'Pune',
  '500': 'Hyderabad',
  '560': 'Bengaluru',
  '600': 'Chennai',
  '700': 'Kolkata',
};

/** First two digits for the North-East and remote areas: slowest delivery. */
export const REMOTE_PREFIXES = ['18', '19', '74', '78', '79', '93', '94', '95', '96', '97', '98'];

/** Army postal service pincodes (9xxxxx): not deliverable by courier. */
export const UNSERVICEABLE_FIRST_DIGIT = '9';

export const DELIVERY_DAYS = {
  metro: 2,
  standard: 3,
  remote: 6,
} as const;

/** Orders under this amount can pay cash on delivery. */
export const COD_LIMIT = 50000;
