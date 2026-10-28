import { memo, useId } from "react";
import "./TravoltaAvatar.css";

const sizes = { sm: "sm", md: "md", lg: "lg" };
const activities = { idle: "idle", listening: "listening", responding: "responding", unread: "unread" };

const TravoltaAvatar = memo(function TravoltaAvatar({
  size = "md",
  activity = "idle",
  animated = true,
}) {
  const id = useId().replace(/:/g, "");
  const paint = (name) => `url(#${id}-${name})`;

  return (
    <div
      className="travolta-avatar"
      data-size={sizes[size] ?? "md"}
      data-activity={activities[activity] ?? "idle"}
      data-animated={animated}
      aria-hidden="true"
    >
      <svg viewBox="0 0 96 96" focusable="false">
        <defs>
          <radialGradient id={`${id}-surface`} cx="30%" cy="20%" r="85%">
            <stop stopColor="#edf0fc" />
            <stop offset="0.55" stopColor="#d6ddf2" />
            <stop offset="1" stopColor="#b6c3e3" />
          </radialGradient>
          <linearGradient id={`${id}-coat`} x1="39" y1="24" x2="62" y2="76" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7986aa" />
            <stop offset="0.45" stopColor="#4b5b81" />
            <stop offset="1" stopColor="#293957" />
          </linearGradient>
          <linearGradient id={`${id}-silks`} x1="37" y1="19" x2="56" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7963e4" />
            <stop offset="1" stopColor="#4338a8" />
          </linearGradient>
          <linearGradient id={`${id}-edge`} x1="17" y1="8" x2="78" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8875d5" />
            <stop offset="0.45" stopColor="#37486c" />
            <stop offset="1" stopColor="#6451ba" />
          </linearGradient>
          <linearGradient id={`${id}-mane`} x1="40" y1="26" x2="25" y2="77" gradientUnits="userSpaceOnUse">
            <stop stopColor="#292844" />
            <stop offset="1" stopColor="#111a2f" />
          </linearGradient>
        </defs>

        <circle cx="48" cy="48" r="46" fill={paint("surface")} stroke={paint("edge")} strokeWidth="1.4" />
        <circle cx="48" cy="48" r="41" fill="none" stroke="#6579ad" strokeOpacity="0.35" strokeWidth="0.7" />
        <path d="M15 62A36 36 0 0 1 28 19" fill="none" stroke="#596e9d" strokeWidth="1.2" strokeDasharray="3 5" opacity="0.5" />

        <g className="travolta-avatar__orbit" fill="none" strokeLinecap="round">
          <circle cx="48" cy="48" r="43" stroke="currentColor" strokeWidth="1.8" strokeDasharray="39 96 17 118" />
          <circle cx="48" cy="48" r="43" stroke="#b1a1ef" strokeWidth="2.4" strokeDasharray="1 269" />
        </g>
        <circle className="travolta-avatar__listening-ring" cx="48" cy="48" r="38" fill="none" stroke="currentColor" strokeWidth="1" />

        <g className="travolta-avatar__portrait">
          <path d="M52 29 57 14Q61 22 58 32Z" fill="#4c587f" />
          <g className="travolta-avatar__ear">
            <path d="M44 30Q41 22 43 11 52 16 53 27L49 32Z" fill={paint("coat")} />
            <path d="M46 17 49 28 45 26Z" fill="#363451" />
          </g>

          <g className="travolta-avatar__mane">
            <path d="M43 27C33 23 29 31 26 36L20 40 24 42 18 51 22 51 16 64 21 62 18 77 29 77C28 60 37 44 43 27Z" fill={paint("mane")} />
            <path d="M35 31 28 40 30 40 25 51M27 56 23 69" fill="none" stroke="#7663b8" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          <path d="M27 79C29 64 33 55 34 44 36 34 40 27 48 24 56 24 61 30 65 36L75 46Q79 51 73 56L64 57 56 50C51 56 50 65 52 78Z" fill={paint("coat")} />
          <path d="M34 46 47 35 43 54 36 77 27 79Z" fill="#253956" opacity="0.6" />
          <path d="M52 32 56 34 62 43 67 47 63 49 58 43 53 37Z" fill="#d3ddf2" />
          <path d="M35 44C37 36 41 31 46 29" fill="none" stroke="#9daccd" strokeWidth="1" opacity="0.6" strokeLinecap="round" />

          {/* Racing helmet and silks give Trav-olta a recognisable trotting identity. */}
          <path d="M33 31C34 20 44 16 54 20 61 23 64 28 64 32L33 33Z" fill={paint("silks")} />
          <path d="M45 20 49 19 55 32 50 33Z" fill="#d5daf3" />
          <path d="M35 31Q49 35 65 31L68 34Q52 39 34 35Z" fill="#433795" />
          <path d="M36 31Q48 34 62 32" fill="none" stroke="#9989e6" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M27 67 38 72 49 65 54 79 28 82 23 77Z" fill={paint("silks")} />
          <path d="M27 67 38 72 35 77 25 72ZM49 65 38 72 43 76 51 71Z" fill="#bdc9e9" />
          <path d="M33 76H39L36 81" fill="none" stroke="#e0e6f5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

          <path d="M55 35Q59 33 63 35" fill="none" stroke="#20273f" strokeWidth="1.8" strokeLinecap="round" />
          <g className="travolta-avatar__eye">
            <path d="M55 39Q59 35 64 39 60 44 55 41Z" fill="#e0e6f5" />
            <ellipse cx="60.5" cy="39.4" rx="2.1" ry="2.5" fill="#182541" />
            <circle cx="61.2" cy="38.4" r="0.7" fill="#ffffff" />
          </g>
          <path d="m71 47 2 1.5" stroke="#1c2944" strokeWidth="2" strokeLinecap="round" />
          <g className="travolta-avatar__jaw">
            <path d="M57 48Q65 54 75 50L73 56 64 58 57 53Z" fill="#62759a" />
            <path d="M62 52Q68 57 74 51" fill="none" stroke="#202c49" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M65 53Q69 54 72 52" fill="none" stroke="#d8e0f1" strokeWidth="1.1" strokeLinecap="round" />
          </g>

          {/* The headset makes the horse recognisable as the chat companion. */}
          <path d="M48 53Q53 62 64 55" fill="none" stroke="#17213c" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M50 55Q55 59 61 56" fill="none" stroke="#8a9ac2" strokeWidth="0.8" />
          <circle cx="47" cy="48" r="6.5" fill="#19233e" stroke="#9684df" strokeWidth="1.2" />
          <circle cx="47" cy="48" r="3.7" fill="#5145a0" stroke="#7968c4" strokeWidth="0.7" />
          <path d="M46 46V50M48 45V51" stroke="#c5c8eb" strokeWidth="1" strokeLinecap="round" />
          <rect x="61" y="54" width="5" height="3" rx="1.5" fill="#1c2642" />
        </g>

        <g className="travolta-avatar__wave" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M61 71V75" />
          <path d="M66 68V78" />
          <path d="M71 70V76" />
          <path d="M76 72V74" />
        </g>
      </svg>
    </div>
  );
});

export default TravoltaAvatar;
