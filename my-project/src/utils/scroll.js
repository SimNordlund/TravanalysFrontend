export function scrollToPageTarget(target = "top") {
  let top = 0;

  if (target !== "top") {
    const element = document.getElementById(target);
    if (!element) return false;

    const navbar = document.querySelector("[data-site-navbar]");
    const offset = (navbar?.getBoundingClientRect().height ?? 64) + 16;
    top = element.getBoundingClientRect().top + window.scrollY - offset;
  }

  // Finish navigation immediately so later content updates cannot interrupt it.
  window.scrollTo({ top: Math.max(0, top), left: 0, behavior: "instant" });
  return true;
}
