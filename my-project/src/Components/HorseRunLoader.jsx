import { useId } from "react";
import "./HorseRunLoader.css";

export default function HorseRunLoader({ label = "Laddar diagram" }) {
  const id = useId().replace(/:/g, "");
  const paint = (name) => `url(#${id}-${name})`;

  return (
    <div className="analysis-horse-loader" role="status" aria-label={label}>
      <svg viewBox="0 0 425 250" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${id}-coat`} x1="0" y1="0" x2="0.8" y2="1">
            <stop stopColor="#fff0c8" />
            <stop offset="0.42" stopColor="#e9bb7c" />
            <stop offset="1" stopColor="#a96547" />
          </linearGradient>
          <linearGradient id={`${id}-neck`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#ffe7b0" /><stop offset="1" stopColor="#ce915f" />
          </linearGradient>
          <linearGradient id={`${id}-track`}>
            <stop stopColor="#818cf8" stopOpacity="0" />
            <stop offset="0.5" stopColor="#818cf8" stopOpacity="0.6" />
            <stop offset="1" stopColor="#818cf8" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g transform="translate(-120 -55)">
          <ellipse className="analysis-horse-loader__shadow" cx="350" cy="272" rx="135" ry="10" fill="#312e81" />
          <g className="analysis-horse-loader__track" fill="none" stroke={paint("track")} strokeWidth="3" strokeDasharray="65 28 12 28">
            <path d="M0 286 H665" /><path d="M0 297 H665" opacity="0.4" />
          </g>

          <g fill="none" stroke="#818cf8" strokeWidth="3">
            <circle cx="223" cy="237" r="29" opacity="0.45" />
            <path d="M223 237 L248 190 L391 166" />
          </g>
          <g className="analysis-horse-loader__driver">
            <path d="M179 199 L213 200 L237 217" fill="none" stroke="#4338ca" strokeWidth="9" strokeLinecap="round" />
            <path d="M179 197 L181 170 Q184 154 199 157 L216 178 L239 175" fill="none" stroke="#6366f1" strokeWidth="12" strokeLinejoin="round" strokeLinecap="round" />
            <path d="M184 168 L201 173" stroke="#e0e7ff" strokeWidth="4" />
            <circle cx="195" cy="143" r="11" fill="#e9bb91" />
            <path d="M182 141 A13 13 0 0 1 208 141 L211 144 H182Z" fill="#4338ca" />
            <path d="M202 144 H210" stroke="#0f172a" strokeWidth="4" />
            <path d="M234 175 Q358 147 492 138" fill="none" stroke="#6366f1" strokeWidth="1.5" />
          </g>

          <g className="analysis-horse-loader__horse">
            <path className="analysis-horse-loader__tail" d="M292 157 C258 142 257 173 224 162 C238 185 271 184 298 169Z" fill="#925b48" />
            <g className="analysis-horse-loader__leg analysis-horse-loader__leg--hind-far" stroke="#93654f" strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M308 181 L324 215 L295 250" /><path d="M295 250 L286 254" stroke="#25243b" strokeWidth="8" />
            </g>
            <g className="analysis-horse-loader__leg analysis-horse-loader__leg--front-far" stroke="#a87554" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M414 181 L402 218 L430 254" /><path d="M430 254 L440 257" stroke="#25243b" strokeWidth="8" />
            </g>

            <path d="M283 162 C288 144 311 139 338 147 C365 155 383 144 407 148 C429 151 441 171 430 189 C418 205 393 206 372 201 L319 198 C292 198 278 186 283 162Z" fill={paint("coat")} />
            <path d="M296 157 Q318 147 343 158 T406 158" fill="none" stroke="#fff1d1" strokeWidth="2" opacity="0.65" />
            <path d="M318 194 Q349 177 388 186 L413 198 Q364 211 318 194" fill="#a66847" opacity="0.3" />

            <g className="analysis-horse-loader__neck">
              <path d="M394 162 C420 143 423 114 445 95 C454 86 468 87 481 101 L491 114 L522 129 Q528 140 514 147 L485 140 L467 125 C456 149 453 180 425 192Z" fill={paint("neck")} />
              <path d="M440 107 Q450 85 464 91 L456 108 L448 107 L438 127 L433 121 L423 146 L418 141 L407 163 L400 159Z" fill="#704e48" />
              <path d="M456 94 L454 72 Q465 76 467 96 M469 96 L475 77 L480 102" fill="#dcad78" />
              <path d="M470 106 L490 129 L505 135" fill="none" stroke="#fff0cf" strokeWidth="4" opacity="0.7" />
              <circle cx="478" cy="112" r="3.2" fill="#172039" /><circle cx="479" cy="111" r="0.8" fill="#fff" />
              <path d="M518 132 L514 135" stroke="#704e48" strokeWidth="3" strokeLinecap="round" />
              <path d="M470 101 L486 139 M505 123 L500 143 L483 139" fill="none" stroke="#303451" strokeWidth="3" />
              <circle cx="486" cy="138" r="4" fill="none" stroke="#e0e7ff" strokeWidth="2" />
            </g>

            <g className="analysis-horse-loader__leg analysis-horse-loader__leg--hind-near" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M300 181 L280 213 L259 250" stroke="#d6a070" strokeWidth="13" />
              <path d="M280 215 L259 250" stroke="#edc18d" strokeWidth="8" />
              <path d="M259 250 L248 253" stroke="#29263e" strokeWidth="9" />
            </g>
            <g className="analysis-horse-loader__leg analysis-horse-loader__leg--front-near" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M417 183 L437 216 L461 250" stroke="#e4b780" strokeWidth="11" />
              <path d="M437 216 L461 250" stroke="#f6d3a0" strokeWidth="7" />
              <path d="M461 250 L472 252" stroke="#29263e" strokeWidth="9" />
            </g>

            <path d="M354 148 L353 190 Q375 200 393 188 L396 149Z" fill="#30365c" />
            <path d="M359 151 L359 188 Q375 194 388 185 L390 152" fill="none" stroke="#a5b4fc" strokeWidth="1.5" />
            <path d="M370 161 H382 L374 181" fill="none" stroke="#fce4b5" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M410 153 Q402 176 413 196" fill="none" stroke="#303451" strokeWidth="5" />
          </g>

          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M179 244 L226 201 L405 177" stroke="#6366f1" strokeWidth="3.5" />
            <path d="M166 204 H206 L215 219" stroke="#4338ca" strokeWidth="5" />
            <circle cx="179" cy="244" r="34" fill="#eef2ff" fillOpacity="0.5" stroke="#4338ca" strokeWidth="3" />
            <circle cx="179" cy="244" r="28" stroke="#a5b4fc" strokeWidth="1" />
            <g className="analysis-horse-loader__wheel" stroke="#818cf8" strokeWidth="1.5">
              <path d="M179 211 V277 M146 244 H212 M156 221 L202 267 M156 267 L202 221" />
            </g>
            <circle cx="179" cy="244" r="5" fill="#4338ca" />
          </g>
          <g className="analysis-horse-loader__dust" fill="#c89162">
            <circle cx="253" cy="261" r="2" /><circle cx="237" cy="266" r="1.5" />
            <circle cx="445" cy="263" r="2" /><circle cx="429" cy="268" r="1" />
          </g>
        </g>
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}
