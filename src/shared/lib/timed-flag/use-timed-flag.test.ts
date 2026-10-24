import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useTimedFlag } from './use-timed-flag';

describe('useTimedFlag', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('гаснет сам через заданное время', () => {
    const { result } = renderHook(() => useTimedFlag(4000));
    expect(result.current[0]).toBe(false);

    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(result.current[0]).toBe(false);
  });

  it('повторный raise продлевает показ', () => {
    const { result } = renderHook(() => useTimedFlag(4000));

    act(() => result.current[1]());
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    act(() => result.current[1]());
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current[0]).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current[0]).toBe(false);
  });
});
