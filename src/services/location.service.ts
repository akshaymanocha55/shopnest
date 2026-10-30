/**
 * Countries, states and cities from the public countriesnow.space API, called through the
 * shared API client. Falls back to a small built-in list if the API is unavailable.
 */
import { env } from '@/config/env';
import { LOCATION_ENDPOINTS } from '@/constants';
import { FALLBACK_LOCATIONS } from '@/data/locations.fallback';
import { apiClient } from './api/client';

interface ApiEnvelope<T> {
  error: boolean;
  msg: string;
  data: T;
}

export interface Country {
  name: string;
  iso2: string;
}

const options = { baseUrl: env.locationApiBaseUrl, auth: false } as const;

function unwrap<T>(response: ApiEnvelope<T>): T {
  if (!response || response.error) throw new Error(response?.msg || 'Location API error');
  return response.data;
}

const sortUnique = (values: string[]) =>
  [...new Set(values.map((v) => v.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));

export const locationService = {
  async getCountries(signal?: AbortSignal): Promise<Country[]> {
    try {
      const data = unwrap(
        await apiClient.get<ApiEnvelope<{ name: string; Iso2: string }[]>>(
          LOCATION_ENDPOINTS.countries,
          {
            ...options,
            signal,
          },
        ),
      );
      return data
        .map((c) => ({ name: c.name, iso2: c.Iso2 }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.warn('[location] countries API unavailable, using fallback:', error);
      return Object.keys(FALLBACK_LOCATIONS).map((name) => ({ name, iso2: '' }));
    }
  },

  async getStates(country: string, signal?: AbortSignal): Promise<string[]> {
    try {
      const data = unwrap(
        await apiClient.post<ApiEnvelope<{ states: { name: string }[] }>>(
          LOCATION_ENDPOINTS.states,
          { country },
          { ...options, signal },
        ),
      );
      return sortUnique(data.states.map((s) => s.name.replace(/ (State|Province)$/, '')));
    } catch (error) {
      console.warn('[location] states API unavailable, using fallback:', error);
      return FALLBACK_LOCATIONS[country]?.states ?? [];
    }
  },

  async getCities(country: string, signal?: AbortSignal): Promise<string[]> {
    try {
      const data = unwrap(
        await apiClient.post<ApiEnvelope<string[]>>(
          LOCATION_ENDPOINTS.cities,
          { country },
          { ...options, signal },
        ),
      );
      return sortUnique(data);
    } catch (error) {
      console.warn('[location] cities API unavailable, using fallback:', error);
      return FALLBACK_LOCATIONS[country]?.cities ?? [];
    }
  },
};
