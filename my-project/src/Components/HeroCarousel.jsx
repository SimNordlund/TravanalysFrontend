import React, { useEffect, useRef, useState } from "react";

export default function HeroCarousel({
  slides = [],
  auto = true,
  interval = 5000,
  className = "",                    //Changed!
  heightClass = "h-56 md:h-96",      //Changed!
  roundedClass = "rounded-lg",       //Changed!
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

  return (
    <div
      className={`relative w-full ${className}`}        //Changed!
      role="region"
      aria-roledescription="carousel"
    >
      {/* Wrapper */}
      <div className={`relative overflow-hidden ${roundedClass} ${heightClass}`}> {/*Changed!*/}
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
              className="absolute inset-0 w-full h-full object-cover" //Changed!
            />
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="absolute z-30 flex -translate-x-1/2 bottom-3 left-1/2 space-x-2"> {/*Changed! lite tightare spacing */}
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`w-2.5 h-2.5 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`} //Changed! mindre prickar
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
        className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-3 cursor-pointer group focus:outline-none" //Changed! smalare paddning
      >
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/30 group-hover:bg-white/50 group-focus:ring-2 group-focus:ring-white"> {/*Changed! mindre knappar */}
          <svg className="w-4 h-4 text-white" viewBox="0 0 6 10" fill="none">
            <path d="M5 1 1 5l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="sr-only">Previous</span>
        </span>
      </button>

      <button
        type="button"
        onClick={next}
        className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-3 cursor-pointer group focus:outline-none" //Changed!
      >
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/30 group-hover:bg-white/50 group-focus:ring-2 group-focus:ring-white"> {/*Changed! */}
          <svg className="w-4 h-4 text-white" viewBox="0 0 6 10" fill="none">
            <path d="m1 9 4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="sr-only">Next</span>
        </span>
      </button>
    </div>
  );
}
