import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroCarousel({
  slides = [],
  auto = true,
  interval = 5000,
  className = "",
  heightClass = "h-56 md:h-96",
  roundedClass = "rounded-lg",
  fit = "cover",
  imgClassName = "",
  letterboxBg = "bg-white",
}) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  const goTo = (i) => setIndex((i + slides.length) % slides.length);
  const prev = () => goTo(index - 1);
  const next = () => goTo(index + 1);

  useEffect(() => {
    if (!auto || slides.length <= 1) return;
    timerRef.current = setTimeout(next, interval);
    return () => clearTimeout(timerRef.current);
  }, [index, auto, interval, slides.length]);

  if (!slides.length) return null;

  const imgFit = fit === "contain" ? "object-contain" : "object-cover";
  const hasMultipleSlides = slides.length > 1;

  return (
    <div
      className={`relative w-full ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label="Analysexempel"
    >
      <div
        className={`relative isolate overflow-hidden ${roundedClass} ${heightClass} ${letterboxBg}`}
      >
        {slides.map((src, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-all duration-700 ease-out ${
              i === index
                ? "opacity-100 scale-100"
                : "pointer-events-none opacity-0 scale-[1.015]"
            }`}
            aria-hidden={i !== index}
            data-carousel-item
          >
            <img
              src={src}
              alt=""
              loading={i === index ? "eager" : "lazy"}
              className={`absolute inset-0 h-full w-full ${imgFit} ${imgClassName}`}
            />
          </div>
        ))}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/10 to-transparent" />
      </div>

      {hasMultipleSlides && (
        <>
          <div className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-md bg-white/90 px-2 py-1.5 shadow-sm ring-1 ring-slate-200 backdrop-blur">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`h-2.5 rounded-full transition-all ${
                  i === index
                    ? "w-6 bg-indigo-600"
                    : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-current={i === index}
                aria-label={`Visa bild ${i + 1}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={prev}
            className="absolute left-3 top-1/2 z-30 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md bg-white/90 text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Föregående bild"
          >
            <ChevronLeft className="h-5 w-5 [stroke-width:2.5]" />
          </button>

          <button
            type="button"
            onClick={next}
            className="absolute right-3 top-1/2 z-30 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md bg-white/90 text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Nästa bild"
          >
            <ChevronRight className="h-5 w-5 [stroke-width:2.5]" />
          </button>
        </>
      )}
    </div>
  );
}
