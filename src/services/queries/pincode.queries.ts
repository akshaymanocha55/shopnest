import { queryOptions } from '@tanstack/react-query';
import { pincodeService } from '../pincode.service';

export const pincodeQueries = {
  check: (pincode: string) =>
    queryOptions({
      queryKey: ['pincode', pincode],
      queryFn: ({ signal }) => pincodeService.check(pincode, signal),
      enabled: pincode.length === 6,
      staleTime: Infinity,
      retry: false,
    }),
};
