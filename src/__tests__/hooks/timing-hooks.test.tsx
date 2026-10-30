import { act, renderHook } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { useThrottledCallback } from '@/hooks/useThrottledCallback';

describe('timing hooks', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('useDebounce updates only after the delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    });
    rerender({ value: 'ab' });
    rerender({ value: 'abc' });
    expect(result.current).toBe('a');
    act(() => jest.advanceTimersByTime(300));
    expect(result.current).toBe('abc');
  });

  it('useDebouncedCallback fires once with the last arguments', () => {
    const spy = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(spy, 200));
    act(() => {
      result.current(1);
      result.current(2);
      result.current(3);
    });
    act(() => jest.advanceTimersByTime(200));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(3);
  });

  it('useThrottledCallback runs immediately, then at most once per window', () => {
    const spy = jest.fn();
    const { result } = renderHook(() => useThrottledCallback(spy, 500));
    act(() => {
      result.current('first');
      result.current('second');
      result.current('third');
    });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith('first');
    act(() => jest.advanceTimersByTime(500));
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith('third');
  });

  it('returns stable function identities across renders', () => {
    const { result, rerender } = renderHook(() => ({
      throttled: useThrottledCallback(() => {}, 100),
      debounced: useDebouncedCallback(() => {}, 100),
    }));
    const first = result.current;
    rerender();
    expect(result.current.throttled).toBe(first.throttled);
    expect(result.current.debounced).toBe(first.debounced);
  });
});
