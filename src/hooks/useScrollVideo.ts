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

export function useScrollVideo(options: ScrollVideoOptions = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);
  const lastProgressRef = useRef(0);
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

  useEffect(() => {
    if (isReducedMotion) return;

    const updateVideoTime = () => {
      const video = videoRef.current;
      if (!video) return;

      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;

      const scrollContainer = optionsRef.current.scrollContainerRef?.current;
      const scrollTop = scrollContainer
        ? scrollContainer.scrollTop
        : window.scrollY;
      const scrollHeight = scrollContainer
        ? scrollContainer.scrollHeight - scrollContainer.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight;

      if (scrollHeight <= 0) return;

      const rawProgress = Math.min(Math.max(scrollTop / scrollHeight, 0), 1);

      if (Math.abs(rawProgress - lastProgressRef.current) < 0.001) {
        rafRef.current = requestAnimationFrame(updateVideoTime);
        return;
      }

      lastProgressRef.current = rawProgress;
      video.currentTime = rawProgress * duration;

      setState((prev) => ({ ...prev, progress: rawProgress }));

      rafRef.current = requestAnimationFrame(updateVideoTime);
    };

    const handleScroll = () => {
      rafRef.current = requestAnimationFrame(updateVideoTime);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isReducedMotion]);

  const handleLoadedMetadata = useCallback(() => {
    setState((prev) => ({ ...prev, isReady: true }));
  }, []);

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
