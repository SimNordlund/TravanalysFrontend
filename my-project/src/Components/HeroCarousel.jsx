import React, { useEffect, useRef, useState } from "react";

export default function HeroCarousel({
  slides = [],
  auto = true,
  interval = 5000,
  className = "",
  heightClass = "h-56 md:h-96",
  roundedClass = "rounded-lg",
  fit = "cover",                 //Changed!
  imgClassName = "",             //Changed!
  letterboxBg = "bg-black/5",    //Changed! bakgrund bakom contain-bild
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

  const imgFit = fit === "contain" ? "object-contain" : "object-cover"; //Changed!

  return (
    <div className={`relative w-full ${className}`} role="region" aria-roledescription="carousel">
      {/* Wrapper */}
      <div className={`relative overflow-hidden ${roundedClass} ${heightClass} ${letterboxBg}`}> {/*Changed!*/}
        {slides.map((src, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === index ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={i !== index}
            data-carousel-item
          >
            <img
              src={src}
              alt=""
              loading={i === index ? "eager" : "lazy"}           //Changed!
              className={`absolute inset-0 w-full h-full ${imgFit} ${imgClassName}`} //Changed!
            />
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="absolute z-30 flex -translate-x-1/2 bottom-3 left-1/2 space-x-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`w-3 h-3 rounded-full ${i === index ? "bg-black" : "bg-blue-200"}`}
            aria-current={i === index}
            aria-label={`Slide ${i + 1}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      {/* Controls */}
      <button
        type="button"
        onClick={prev}
        className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-3 cursor-pointer group focus:outline-none"
      >
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 group-hover:group-hover:bg-indigo-300 group-focus:ring-2 group-focus:ring-white">
          <svg className="w-4 h-4 text-white" viewBox="0 0 6 10" fill="none">
            <path d="M5 1 1 5l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="sr-only">Previous</span>
        </span>
      </button>

      <button
        type="button"
        onClick={next}
        className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-3 cursor-pointer group focus:outline-none"
      >
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 group-hover:bg-indigo-300 group-focus:ring-2 group-focus:ring-white">
          <svg className="w-4 h-4 text-white" viewBox="0 0 6 10" fill="none">
            <path d="m1 9 4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="sr-only">Next</span>
        </span>
      </button>
    </div>
  );
}
