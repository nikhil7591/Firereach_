import { useEffect, useRef, useState } from 'react';

export default function LoadingScreen() {
  const videoRef = useRef(null);
  const [hidden, setHidden] = useState(false);

  const shouldSkipIntro =
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/payment-demo/') ||
      window.location.pathname.startsWith('/profile') ||
      window.location.pathname.startsWith('/settings') ||
      new URLSearchParams(window.location.search).get('noIntro') === '1');

  useEffect(() => {
    if (shouldSkipIntro) {
      setHidden(true);
      return undefined;
    }

    const video = videoRef.current;
    if (!video) {
      return undefined;
    }

    let cancelled = false;

    const tryPlay = async () => {
      if (cancelled) {
        return;
      }

      video.currentTime = 0;

      try {
        video.muted = false;
        video.volume = 1;
        await video.play();
      } catch {
        // If sound autoplay is blocked, fallback to muted autoplay without prompting button.
        try {
          video.muted = true;
          await video.play();
        } catch {
          setHidden(true);
        }
      }
    };

    const handleEnded = () => setHidden(true);
    const handleError = () => setHidden(true);

    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    tryPlay();

    return () => {
      cancelled = true;
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [shouldSkipIntro]);

  if (hidden) return null;

  return (
    <div className="intro-video-overlay" role="status" aria-label="Starting intro video">
      <video
        ref={videoRef}
        className="intro-video"
        src="/starting.mp4"
        autoPlay
        muted={false}
        playsInline
        preload="auto"
      />
    </div>
  );
}
