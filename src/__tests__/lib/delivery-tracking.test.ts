import { DELIVERY_DAYS } from '@/constants';
import { getDeliveryRule, isValidPincode } from '@/lib/delivery';
import { getTrackingSteps, trackingNumber } from '@/lib/tracking';

describe('delivery rules', () => {
  it('validates pincodes', () => {
    expect(isValidPincode('110092')).toBe(true);
    expect(isValidPincode('011092')).toBe(false);
    expect(isValidPincode('11009')).toBe(false);
  });

  it('gives metro pincodes 2-day express delivery', () => {
    expect(getDeliveryRule('110092')).toMatchObject({
      deliverable: true,
      zone: 'metro',
      days: DELIVERY_DAYS.metro,
      metroName: 'Delhi',
    });
    expect(getDeliveryRule('560001').metroName).toBe('Bengaluru');
  });

  it('gives remote and standard areas longer estimates', () => {
    expect(getDeliveryRule('781001')).toMatchObject({ zone: 'remote', days: DELIVERY_DAYS.remote });
    expect(getDeliveryRule('302001')).toMatchObject({
      zone: 'standard',
      days: DELIVERY_DAYS.standard,
    });
  });

  it('does not deliver to army postal pincodes', () => {
    expect(getDeliveryRule('901234').deliverable).toBe(false);
  });
});

describe('order tracking', () => {
  const placedAt = '2026-10-31T10:00:00.000Z';
  const estimatedDelivery = '2026-11-02T10:00:00.000Z';
  const at = (iso: string) => new Date(iso).getTime();

  it('only "Order placed" is done right after ordering', () => {
    const steps = getTrackingSteps({ placedAt, estimatedDelivery }, at(placedAt));
    expect(steps.filter((s) => s.done).map((s) => s.key)).toEqual(['ordered']);
    expect(steps.find((s) => s.current)?.key).toBe('ordered');
  });

  it('progresses through the steps over time', () => {
    const midway = getTrackingSteps(
      { placedAt, estimatedDelivery },
      at('2026-11-01T10:00:00.000Z'),
    );
    expect(midway.find((s) => s.current)?.key).toBe('shipped');
    const after = getTrackingSteps({ placedAt, estimatedDelivery }, at('2026-11-03T00:00:00.000Z'));
    expect(after.every((s) => s.done)).toBe(true);
    expect(after.find((s) => s.current)?.key).toBe('delivered');
  });

  it('builds a stable tracking number', () => {
    expect(trackingNumber('SN123ABC')).toBe(trackingNumber('SN123ABC'));
    expect(trackingNumber('SN123ABC')).toMatch(/^SNX[0-9A-Z]{8}$/);
  });
});
