import { queryOptions } from '@tanstack/react-query';
import { locationService } from '../location.service';

const DAY = 24 * 60 * 60 * 1000;

/** Location data rarely changes, so it stays fresh for a day and is shared app-wide. */
export const locationQueries = {
  countries: () =>
    queryOptions({
      queryKey: ['location', 'countries'],
      queryFn: ({ signal }) => locationService.getCountries(signal),
      staleTime: DAY,
      gcTime: DAY,
    }),
  states: (country: string) =>
    queryOptions({
      queryKey: ['location', 'states', country],
      queryFn: ({ signal }) => locationService.getStates(country, signal),
      enabled: Boolean(country),
      staleTime: DAY,
      gcTime: DAY,
    }),
  cities: (country: string) =>
    queryOptions({
      queryKey: ['location', 'cities', country],
      queryFn: ({ signal }) => locationService.getCities(country, signal),
      enabled: Boolean(country),
      staleTime: DAY,
      gcTime: DAY,
    }),
};
