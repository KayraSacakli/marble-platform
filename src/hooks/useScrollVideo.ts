'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

interface ScrollVideoState {
  progress: number;
  isReady: boolean;
  hasError: boolean;
  isReducedMotion: boolean;
}

interface ScrollVideoOptions {
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Scroll position -> video currentTime with critically-damped smoothing.
 *
 * The raw scroll ratio is a *target*; a requestAnimationFrame loop eases the
 * displayed time toward it (exponential lerp), so quick scroll gestures glide
 * instead of snapping frame-to-frame. Frames are scheduled on demand (scroll /
 * resize / metadata) and stop once the target is reached, keeping idle CPU
 * at zero. The video is never allowed to fall arbitrarily far behind the
 * user: the lerp always chases the latest scroll position.
 */
const SETTLE_EPSILON = 0.0004;
const LERP_FACTOR = 0.14;
/** Skip currentTime writes smaller than half a frame at 24 fps. */
const TIME_WRITE_EPSILON = 1 / 48;

export function useScrollVideo(options: ScrollVideoOptions = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);
  const framePendingRef = useRef(false);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const lastWrittenTimeRef = useRef(-1);
  const optionsRef = useRef(options);

  const [state, setState] = useState<ScrollVideoState>(() => {
    const isReducedMotion =
      typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;
    return {
      progress: 0,
      isReady: false,
      hasError: false,
      isReducedMotion,
    };
  });

  const isReducedMotion = state.isReducedMotion;

  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => {
      setState((prev) => ({ ...prev, isReducedMotion: e.matches }));
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const readTargetProgress = useCallback(() => {
    const scrollContainer = optionsRef.current.scrollContainerRef?.current;
    const scrollTop = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
    const scrollHeight = scrollContainer
      ? scrollContainer.scrollHeight - scrollContainer.clientHeight
      : document.documentElement.scrollHeight - window.innerHeight;

    if (scrollHeight <= 0) return 0;
    return Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
  }, []);

  useEffect(() => {
    if (isReducedMotion) return;

    const scheduleFrame = () => {
      if (framePendingRef.current) return;
      framePendingRef.current = true;
      rafRef.current = requestAnimationFrame(applyFrame);
    };

    const applyFrame = () => {
      rafRef.current = 0;
      framePendingRef.current = false;

      const video = videoRef.current;
      if (!video) return;
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;

      const target = targetProgressRef.current;
      let current = currentProgressRef.current;
      const delta = target - current;

      if (Math.abs(delta) > SETTLE_EPSILON) {
        current += delta * LERP_FACTOR;
      } else {
        current = target;
      }
      currentProgressRef.current = current;

      const time = current * duration;
      if (Math.abs(time - lastWrittenTimeRef.current) > TIME_WRITE_EPSILON) {
        video.currentTime = time;
        lastWrittenTimeRef.current = time;
      }

      if (current !== target) {
        scheduleFrame();
      } else {
        setState((prev) => (prev.progress === target ? prev : { ...prev, progress: target }));
      }
    };

    const handleScrollOrResize = () => {
      targetProgressRef.current = readTargetProgress();
      scheduleFrame();
    };

    targetProgressRef.current = readTargetProgress();
    currentProgressRef.current = targetProgressRef.current;
    handleScrollOrResize();

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      framePendingRef.current = false;
    };
  }, [isReducedMotion, readTargetProgress]);

  const handleLoadedMetadata = useCallback(() => {
    // Snap to the current scroll position on load so the video never starts
    // from frame 0 while the visitor is already mid-page.
    const video = videoRef.current;
    const target = readTargetProgress();
    targetProgressRef.current = target;
    currentProgressRef.current = target;
    if (video && Number.isFinite(video.duration) && video.duration > 0) {
      video.currentTime = target * video.duration;
      lastWrittenTimeRef.current = video.currentTime;
    }
    setState((prev) => ({ ...prev, isReady: true, progress: target }));
  }, [readTargetProgress]);

  const handleError = useCallback(() => {
    setState((prev) => ({ ...prev, hasError: true, isReady: false }));
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
    };
  }, [handleLoadedMetadata, handleError]);

  return {
    videoRef,
    ...state,
  };
}
