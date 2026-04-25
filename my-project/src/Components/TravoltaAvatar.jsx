const avatarSizeClasses = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-14 w-14",
};

export default function TravoltaAvatar({ size = "md", speaking = false }) {
  const mouthClassName = speaking
    ? "animate-travchat-avatar-speak"
    : "scale-y-50";

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-gray-600 via-indigo-700 to-blue-500 shadow-md ring-1 ring-indigo-900/10 ${avatarSizeClasses[size]}`}
      aria-hidden="true"
    >
      {speaking && <span className="absolute inset-0 rounded-full" />}
      <svg
        className="relative h-full w-full animate-travchat-avatar-bob p-1.5 motion-reduce:animate-none"
        viewBox="0 0 64 64"
        focusable="false"
      >
        <path
          className="fill-indigo-900/25"
          d="M14 50c7 4 24 4 34 0 4-2 5-6 1-8-8-4-26-4-34 0-4 2-5 6-1 8Z"
        />
        <path
          className="animate-travchat-avatar-ear fill-indigo-200 [transform-box:fill-box] [transform-origin:50%_90%] motion-reduce:animate-none"
          d="M29 17 34 5l6 13-5 5Z"
        />
        <path
          className="fill-indigo-100"
          d="M20 50c2-6 4-12 4-19 0-6 3-11 8-14l6-4c7 1 13 6 16 14l3 8c1 4-1 8-5 9l-8 2c-3 1-6-1-8-4l-2-4c-3 2-5 5-6 9l-1 5Z"
        />
        <path
          className="fill-indigo-900"
          d="M24 31c0-7 3-12 8-16l4-3c1 8-1 15-6 22-2 3-4 7-5 12l-5 4c2-6 4-12 4-19Z"
        />
        <path
          className="fill-none stroke-indigo-900 [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:2.4]"
          d="M36 19c6 1 11 5 14 12m-15 8c3-2 6-3 10-3"
        />
        <ellipse
          className="animate-travchat-avatar-blink fill-indigo-950 [transform-box:fill-box] [transform-origin:center] motion-reduce:animate-none"
          cx="47"
          cy="29"
          rx="2"
          ry="2.6"
        />
        <path
          className={`${mouthClassName} fill-none stroke-indigo-950 [stroke-linecap:round] [stroke-width:2.4] [transform-box:fill-box] [transform-origin:center] motion-reduce:animate-none`}
          d="M45 40c3 2 6 1 8-1"
        />
      </svg>
    </div>
  );
}
