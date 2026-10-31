/**
 * Pincode check: India Post's public API gives the area/district/state name, and the
 * delivery rule table gives the delivery time. If the API is down, the delivery time still
 * works; only the area name is missing.
 */
import { env } from '@/config/env';
import { PINCODE_ENDPOINTS } from '@/constants';
import { getDeliveryRule, isValidPincode, type DeliveryZone } from '@/lib/delivery';
import { ApiError } from '@/lib/errors';
import { apiClient } from './api/client';

interface PostOffice {
  Name: string;
  District: string;
  State: string;
}

type PincodeApiResponse = {
  Status: 'Success' | 'Error' | '404';
  Message: string;
  PostOffice: PostOffice[] | null;
}[];

export interface PincodeResult {
  pincode: string;
  deliverable: boolean;
  zone: DeliveryZone | null;
  days: number | null;
  area: string | null;
  district: string | null;
  state: string | null;
}

export const pincodeService = {
  async check(pincode: string, signal?: AbortSignal): Promise<PincodeResult> {
    if (!isValidPincode(pincode)) {
      throw new ApiError('Enter a valid 6-digit pincode', 400, 'VALIDATION');
    }
    const rule = getDeliveryRule(pincode);
    let place: PostOffice | undefined;
    let unknownPincode = false;

    try {
      const response = await apiClient.get<PincodeApiResponse>(PINCODE_ENDPOINTS.lookup(pincode), {
        baseUrl: env.pincodeApiBaseUrl,
        auth: false,
        signal,
        timeoutMs: 6000,
      });
      const result = response?.[0];
      if (result?.Status === 'Success') place = result.PostOffice?.[0];
      else unknownPincode = true;
    } catch (error) {
      console.warn('[pincode] lookup unavailable, using delivery rules only:', error);
    }

    return {
      pincode,
      deliverable: rule.deliverable && !unknownPincode,
      zone: rule.zone,
      days: rule.days,
      area: place?.Name ?? rule.metroName ?? null,
      district: place?.District ?? null,
      state: place?.State ?? null,
    };
  },
};
