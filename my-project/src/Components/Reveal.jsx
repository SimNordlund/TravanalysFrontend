import { useEffect, useRef, useState } from "react";

const delayClasses = {
  none: "delay-0",
  short: "delay-100",
  medium: "delay-200",
  long: "delay-300",
};

export default function Reveal({
  children,
  className = "",
  delay = "none",
  once = true,
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={`transform-gpu transition-all duration-700 ease-out motion-reduce:transition-none ${
        delayClasses[delay] ?? delayClasses.none
      } ${
        isVisible
          ? "translate-y-0 opacity-100 blur-0"
          : "translate-y-5 opacity-0 blur-[2px]"
      } ${className}`}
    >
      {children}
    </div>
  );
}
