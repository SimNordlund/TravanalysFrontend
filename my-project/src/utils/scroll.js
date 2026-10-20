let stopActiveScroll = null;

export function scrollToPageTarget(target = "top", { behavior = "instant" } = {}) {
  let top = 0;

  if (target !== "top") {
    const element = document.getElementById(target);
    if (!element) return false;

    const navbar = document.querySelector("[data-site-navbar]");
    const offset = (navbar?.getBoundingClientRect().height ?? 64) + 16;
    top = element.getBoundingClientRect().top + window.scrollY - offset;
  }

  stopActiveScroll?.();

  const destination = Math.max(0, Math.min(
    top,
    document.documentElement.scrollHeight - window.innerHeight,
  ));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (behavior !== "smooth" || reduceMotion) {
    window.scrollTo({ top: destination, left: 0, behavior: "instant" });
    return true;
  }

  const start = window.scrollY;
  const distance = destination - start;
  if (Math.abs(distance) < 1) return true;

  const startedAt = performance.now();
  const duration = 1000;
  let frame;

  const stop = () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchstart", stop);
    window.removeEventListener("pointerdown", stop);
    window.removeEventListener("keydown", onKeyDown);
    if (stopActiveScroll === stop) stopActiveScroll = null;
  };
  const onKeyDown = (event) => {
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Escape"].includes(event.key)) {
      stop();
    }
  };
  const step = (now) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    window.scrollTo({ top: start + distance * eased, left: 0, behavior: "instant" });
    if (progress < 1) frame = requestAnimationFrame(step);
    else stop();
  };

  stopActiveScroll = stop;
  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("touchstart", stop, { passive: true });
  window.addEventListener("pointerdown", stop, { passive: true });
  window.addEventListener("keydown", onKeyDown);
  frame = requestAnimationFrame(step);
  return true;
}
