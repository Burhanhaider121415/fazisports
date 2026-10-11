(() => {
  const video = document.querySelector('.lookbook-video[data-autoplay="in-view"]');
  if (!video || !('IntersectionObserver' in window)) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const constrained = connection?.saveData || ['slow-2g', '2g'].includes(connection?.effectiveType);
  video.muted = true;
  video.defaultMuted = true;
  video.setAttribute('muted', '');
  let inView = false;

  const syncPlayback = () => {
    if (reducedMotion.matches || constrained || document.visibilityState !== 'visible' || !inView) {
      if (!video.paused) video.pause();
      return;
    }
    if (video.paused) video.play().catch(() => {});
  };

  const observer = new IntersectionObserver(entries => {
    inView = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.25);
    syncPlayback();
  }, { threshold: [0, 0.25] });
  observer.observe(video);
  reducedMotion.addEventListener('change', syncPlayback);
  document.addEventListener('visibilitychange', syncPlayback);
})();
