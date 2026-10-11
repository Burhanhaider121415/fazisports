(() => {
  const video = document.querySelector('.lookbook-video[data-autoplay="in-view"]');
  if (!video) return;

  const connection = navigator.connection;
  const constrained = connection?.saveData || ['slow-2g', '2g'].includes(connection?.effectiveType);
  video.muted = true;
  video.defaultMuted = true;
  video.setAttribute('muted', '');
  let inView = false;

  if (!('IntersectionObserver' in window)) inView = true;

  const syncPlayback = () => {
    if (constrained || document.visibilityState !== 'visible' || !inView) {
      video.autoplay = false;
      video.removeAttribute('autoplay');
      if (!video.paused) video.pause();
      return;
    }
    video.autoplay = true;
    video.setAttribute('autoplay', '');
    if (video.paused) video.play().catch(() => {});
  };

  if (!('IntersectionObserver' in window)) {
    syncPlayback();
    return;
  }

  const observer = new IntersectionObserver(entries => {
    inView = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.25);
    syncPlayback();
  }, { threshold: [0, 0.25] });
  observer.observe(video);
  document.addEventListener('visibilitychange', syncPlayback);
})();
