// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScrollVideo } from '@/hooks/useScrollVideo';

describe('useScrollVideo', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1000, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 500, writable: true, configurable: true });

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? false : false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial state with progress 0', () => {
    const { result } = renderHook(() => useScrollVideo());
    expect(result.current.progress).toBe(0);
    expect(result.current.isReady).toBe(false);
    expect(result.current.hasError).toBe(false);
  });

  it('provides videoRef', () => {
    const { result } = renderHook(() => useScrollVideo());
    expect(result.current.videoRef).toBeDefined();
    expect(result.current.videoRef.current).toBeNull();
  });

  it('detects reduced motion preference', () => {
    window.matchMedia = vi.fn().mockImplementation((q: string) => ({
      matches: q === '(prefers-reduced-motion: reduce)' ? true : false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useScrollVideo());
    expect(result.current.isReducedMotion).toBe(true);
  });

  it('defaults to no reduced motion', () => {
    const { result } = renderHook(() => useScrollVideo());
    expect(result.current.isReducedMotion).toBe(false);
  });

  it('handles zero scroll height gracefully', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 500, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 500, writable: true, configurable: true });

    const { result } = renderHook(() => useScrollVideo());
    expect(result.current.progress).toBe(0);
  });

  it('does not update progress when reduced motion is active', () => {
    window.matchMedia = vi.fn().mockImplementation((q: string) => ({
      matches: q === '(prefers-reduced-motion: reduce)' ? true : false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useScrollVideo());
    expect(result.current.isReducedMotion).toBe(true);
    expect(result.current.progress).toBe(0);
  });

  it('clamps progress between 0 and 1', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1000, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 500, writable: true, configurable: true });

    const { result } = renderHook(() => useScrollVideo());
    expect(result.current.progress).toBe(0);
  });

  it('cleans up scroll listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useScrollVideo());
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('handles matchMedia change events', () => {
    let changeHandler: ((e: MediaQueryListEvent) => void) | undefined;
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') changeHandler = handler;
      }),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useScrollVideo());

    act(() => {
      changeHandler?.({ matches: true } as unknown as MediaQueryListEvent);
    });

    expect(result.current.isReducedMotion).toBe(true);
  });
});
