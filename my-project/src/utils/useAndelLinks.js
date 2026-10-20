import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
let pendingButtonsRequest = null;

const normalizeAppUrlButtons = (data) => {
  const rawButtons = Array.isArray(data)
    ? data
    : Array.isArray(data?.buttons)
    ? data.buttons
    : Array.isArray(data?.appUrls)
    ? data.appUrls
    : data?.v85 || data?.v86
    ? [data?.v85, data?.v86].filter(Boolean)
    : data?.url
    ? [data]
    : data && typeof data === "object"
    ? Object.values(data)
    : [];

  return rawButtons
    .filter((button) => button && typeof button === "object")
    .map((button, index) => {
      const id = button.id ?? button.appUrlId ?? button.buttonId ?? index;
      const numericId = Number(id);
      const fallbackLabel =
        numericId === 1 ? "V85" : numericId === 2 ? "V86" : "Köpandel.se";

      return {
        id,
        url: button.url || button.href || button.link || button.appUrl || "",
        date:
          button.date ||
          button.spelstopp ||
          button.startTime ||
          button.startDate ||
          button.deadline ||
          "",
        label:
          button.label ||
          button.buttonText ||
          button.title ||
          button.name ||
          button.raceType ||
          button.spelform ||
          button.gameType ||
          fallbackLabel,
      };
    })
    .filter((button) => button.url);
};

export const parseCompactDate = (value) => {
  const s = String(value || "").trim();

  if (/^\d{12}$/.test(s)) {
    const year = Number(s.slice(0, 4));
    const month = Number(s.slice(4, 6)) - 1;
    const day = Number(s.slice(6, 8));
    const hour = Number(s.slice(8, 10));
    const minute = Number(s.slice(10, 12));
    const d = new Date(year, month, day, hour, minute, 0);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (/^\d{8}$/.test(s)) {
    const year = Number(s.slice(0, 4));
    const month = Number(s.slice(4, 6)) - 1;
    const day = Number(s.slice(6, 8));
    const d = new Date(year, month, day, 0, 0, 0);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatCountdown = (targetDate, nowMs = Date.now()) => {
  const diffMs = targetDate.getTime() - nowMs;
  if (diffMs <= 0) return "Spelstopp passerad";

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
  return `${hours}h ${minutes}m ${seconds}s`;
};

const getAppUrlIdForToday = () => {
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "Europe/Stockholm",
  }).format(new Date());

  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dayNumber = dayMap[weekday];

  if (dayNumber >= 0 && dayNumber <= 3) return 2;
  return 1;
};

async function fetchAndelButtons() {
  try {
    const response = await fetch(`${API_BASE_URL}/app_url/buttons`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buttons = normalizeAppUrlButtons(await response.json());
    if (buttons.length) return buttons;
    throw new Error("No app_url buttons in response");
  } catch (err) {
    console.error("Kunde inte hämta app_url buttons", err);
    try {
      const response = await fetch(`${API_BASE_URL}/app_url/${getAppUrlIdForToday()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return normalizeAppUrlButtons(await response.json());
    } catch (fallbackErr) {
      console.error("Kunde inte hämta app_url fallback", fallbackErr);
      return [];
    }
  }
}

function loadAndelButtons() {
  if (!pendingButtonsRequest) {
    pendingButtonsRequest = fetchAndelButtons().finally(() => {
      pendingButtonsRequest = null;
    });
  }
  return pendingButtonsRequest;
}

export default function useAndelLinks() {
  const [buttons, setButtons] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let isMounted = true;
    if (API_BASE_URL) {
      loadAndelButtons().then((nextButtons) => {
        if (!isMounted) return;
        setButtons(nextButtons);
        setLoaded(true);
      });
    } else {
      setLoaded(true);
    }
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!buttons.some((button) => parseCompactDate(button.date))) return;
    const tick = () => setNow(Date.now());
    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [buttons]);

  return { buttons, loaded, now };
}
