function triggerConfetti(options = {}) {
  const board = document.getElementById('board');
  if (!board) return; // Exit if board element is not found

  const defaults = {
    particleCount: 100,
    spread: 70,
  };
  const config = { ...defaults, ...options };

  const rect = board.getBoundingClientRect();
  const centerX = (rect.left + rect.right) / 2;
  const centerY = (rect.top + rect.bottom) / 2;

  confetti({
    particleCount: config.particleCount,
    spread: config.spread,
    origin: {
      x: centerX / window.innerWidth,
      y: centerY / window.innerHeight,
    },
  });
}