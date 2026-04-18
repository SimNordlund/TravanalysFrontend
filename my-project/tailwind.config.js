/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "horse-loader-body": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "horse-loader-head": {
          "0%, 100%": { transform: "rotate(-2deg) translateY(0)" },
          "50%": { transform: "rotate(3deg) translateY(2px)" },
        },
        "horse-loader-tail": {
          "0%, 100%": { transform: "rotate(-9deg)" },
          "50%": { transform: "rotate(12deg)" },
        },
        "horse-loader-front-a": {
          "0%, 100%": { transform: "rotate(24deg)" },
          "50%": { transform: "rotate(-26deg) translateY(2px)" },
        },
        "horse-loader-front-b": {
          "0%, 100%": { transform: "rotate(-22deg) translateY(2px)" },
          "50%": { transform: "rotate(26deg)" },
        },
        "horse-loader-back-a": {
          "0%, 100%": { transform: "rotate(-24deg) translateY(2px)" },
          "50%": { transform: "rotate(26deg)" },
        },
        "horse-loader-back-b": {
          "0%, 100%": { transform: "rotate(24deg)" },
          "50%": { transform: "rotate(-26deg) translateY(2px)" },
        },
        "horse-loader-shadow": {
          "0%, 100%": { transform: "scaleX(1)", opacity: "0.12" },
          "50%": { transform: "scaleX(0.78)", opacity: "0.08" },
        },
        "horse-loader-ground": {
          "0%": { transform: "translateX(32px)", opacity: "0" },
          "20%, 75%": { opacity: "0.75" },
          "100%": { transform: "translateX(-40px)", opacity: "0" },
        },
      },
      animation: {
        "horse-loader-body":
          "horse-loader-body 640ms cubic-bezier(0.45, 0, 0.55, 1) infinite",
        "horse-loader-head":
          "horse-loader-head 640ms cubic-bezier(0.45, 0, 0.55, 1) infinite",
        "horse-loader-tail":
          "horse-loader-tail 520ms cubic-bezier(0.45, 0, 0.55, 1) infinite",
        "horse-loader-front-a":
          "horse-loader-front-a 520ms cubic-bezier(0.45, 0, 0.55, 1) infinite",
        "horse-loader-front-b":
          "horse-loader-front-b 520ms cubic-bezier(0.45, 0, 0.55, 1) infinite",
        "horse-loader-back-a":
          "horse-loader-back-a 520ms cubic-bezier(0.45, 0, 0.55, 1) infinite",
        "horse-loader-back-b":
          "horse-loader-back-b 520ms cubic-bezier(0.45, 0, 0.55, 1) infinite",
        "horse-loader-shadow":
          "horse-loader-shadow 640ms cubic-bezier(0.45, 0, 0.55, 1) infinite",
        "horse-loader-ground": "horse-loader-ground 720ms linear infinite",
      },
    },
  },
  plugins: [],
}
