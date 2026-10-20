import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { scrollToPageTarget } from "../utils/scroll";

export default function NavigationScroll() {
  const location = useLocation();
  const previousLocation = useRef(null);

  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    const previous = previousLocation.current;
    const pageChanged = previous?.pathname !== location.pathname;
    const hashChanged = previous?.hash !== location.hash;
    const entryChanged = previous?.key !== location.key;
    previousLocation.current = location;

    if (!pageChanged && !hashChanged && !entryChanged) return;

    const requestedTarget = entryChanged ? location.state?.scrollTarget : null;
    // Filter changes update the query string without moving the page.
    if (!pageChanged && !requestedTarget && (!hashChanged || !location.hash)) return;

    let hashTarget = location.hash.slice(1);
    try {
      hashTarget = decodeURIComponent(hashTarget);
    } catch {
      // A malformed URL fragment should not prevent normal navigation.
    }

    const target = hashTarget || requestedTarget || "top";
    if (!scrollToPageTarget(target) && pageChanged) {
      scrollToPageTarget("top");
    }
  }, [location]);

  return null;
}
