import { DocumentTextIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { FaFacebook } from "react-icons/fa";
//import { FaInstagram } from "react-icons/fa";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { useState, useEffect, useRef } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const hideTimer = useRef();

  const [kopandelButtons, setKopandelButtons] = useState([]);
  const [kopandelLoaded, setKopandelLoaded] = useState(false);
  const [countdownNow, setCountdownNow] = useState(() => Date.now());

  useEffect(() => {
    if (!message) return;
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setMessage(""), 15000);
    return () => clearTimeout(hideTimer.current);
  }, [message]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const isPhoneValid = (raw) => {
    if (!raw) return true;
    const digits = raw.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
  };

  const safeParseJson = async (response) => {
    try {
      const ct = response.headers.get("content-type") || "";
      if (ct.includes("application/json")) return await response.json();
      const text = await response.text();
      return text ? { message: text } : null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!consent) {
      alert("Du måste godkänna lagring av uppgifter.");
      return;
    }
    if (!email && !phone) {
      alert("Fyll i e-post, telefonnummer eller båda.");
      return;
    }

    if (phone && !isPhoneValid(phone)) {
      setIsError(true);
      setMessage("Felaktigt format, kunde inte spara");
      return;
    }

    try {
      const payload = {};
      if (email) payload.email = email;
      if (phone) payload.phone = phone;

      const response = await fetch(`${API_BASE_URL}/contact/storeInfo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setIsError(true);
        if (response.status === 400) {
          setMessage("Felaktigt format, kunde inte spara");
        } else {
          const data = await safeParseJson(response);
          const serverMsg =
            (data && (data.message || data.error)) ||
            "Misslyckades att spara uppgifter";
          setMessage(serverMsg);
        }
        return;
      }

      setIsError(false);
      setMessage("Tack! Du får nu uppdateringar när något häftigt sker.");
      setEmail("");
      setPhone("");
      setConsent(false);
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage("Något gick fel, försök igen senare.");
    }
  };

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

  const parseCompactDate = (value) => {
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

  const formatCountdown = (targetDate, nowMs = Date.now()) => {
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

  const loadAppUrlById = async (id) => {
    const response = await fetch(`${API_BASE_URL}/app_url/${id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return normalizeAppUrlButtons(await response.json());
  };

  useEffect(() => {
    let isMounted = true;

    const loadAppUrlButtons = async () => {
      setKopandelLoaded(false);

      try {
        const response = await fetch(`${API_BASE_URL}/app_url/buttons`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const buttons = normalizeAppUrlButtons(await response.json());

        if (buttons.length) {
          if (isMounted) setKopandelButtons(buttons);
          return;
        }

        throw new Error("No app_url buttons in response");
      } catch (err) {
        console.error("Kunde inte hämta app_url buttons", err);

        try {
          const fallbackButtons = await loadAppUrlById(getAppUrlIdForToday());
          if (isMounted) setKopandelButtons(fallbackButtons);
        } catch (fallbackErr) {
          console.error("Kunde inte hämta app_url fallback", fallbackErr);
          if (isMounted) setKopandelButtons([]);
        }
      } finally {
        if (isMounted) setKopandelLoaded(true);
      }
    };

    if (API_BASE_URL) {
      loadAppUrlButtons();
    } else {
      setKopandelLoaded(true);
    }

    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL]);

  useEffect(() => {
    const hasCountdown = kopandelButtons.some((button) =>
      parseCompactDate(button.date)
    );

    if (!hasCountdown) return;

    const tick = () => setCountdownNow(Date.now());
    tick();

    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [kopandelButtons]);
  return (
    <div className="relative isolate overflow-hidden bg-gray-900 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
          <div className="max-w-xl lg:max-w-lg">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Prenumerera
            </h2>
            <h3 className="text-1xl font-bold tracking-tight text-white sm:text-1xl mt-2 sm:mt-2">
              Ange e-post och/eller telefonnummer
            </h3>
            <form
              onSubmit={handleSubmit}
              className="mt-4 flex flex-col gap-y-4"
            >
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                placeholder="Skriv in din e-post"
              />

              <label htmlFor="phone-number" className="sr-only">
                Phone number
              </label>
              <input
                id="phone-number"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                placeholder="Skriv in ditt telefonnummer"
                pattern="[\d\s()+-]{7,}"
              />

              <div className="flex items-center">
                <input
                  id="consent"
                  name="consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  required
                />
                <label
                  htmlFor="consent"
                  className="ml-2 block text-sm text-white"
                >
                  Jag godkänner att mina uppgifter lagras
                </label>
              </div>
              <button
                type="submit"
                className="self-start rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50"
                disabled={!consent || (!email && !phone)}
              >
                Prenumerera
              </button>
            </form>

            {message && (
              <div
                className={`rounded-md p-3 mt-3 ${
                  isError ? "bg-red-600/20" : "bg-green-600/20"
                }`}
              >
                <p
                  className={`text-sm ${
                    isError ? "text-red-300" : "text-green-300"
                  }`}
                >
                  {message}
                </p>
              </div>
            )}
          </div>

          <dl className="grid grid-cols-1 gap-x-8 gap-y-10 sm:gap-y-2 sm:grid-cols-2 sm:mt-6">
            <div className="flex flex-col items-center">
              <div className="flex flex-wrap justify-center gap-3">
                {kopandelButtons.length ? (
                  kopandelButtons.map((button, index) => {
                    const target = parseCompactDate(button.date);
                    const countdown = target
                      ? formatCountdown(target, countdownNow)
                      : "Spelstopp saknas";

                    return (
                      <a
                        key={`${button.id}-${button.url}-${index}`}
                        href={button.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-w-[7rem] flex-col items-center rounded-xl bg-white/10 p-3 ring-1 ring-white/20 shadow-sm hover:ring-indigo-400/60 hover:shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5"
                      >
                        <DocumentTextIcon
                          className="h-8 w-8 text-white"
                          aria-hidden="true"
                        />
                        <span className="mt-2 text-xs font-semibold text-white">
                          {button.label}
                        </span>
                        <span className="mt-1 text-center text-[11px] font-bold text-indigo-300">
                          {countdown}
                        </span>
                      </a>
                    );
                  })
                ) : (
                  <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20 shadow-sm">
                    <DocumentTextIcon
                      className="h-8 w-8 text-white"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </div>
              <dt className="mt-4 font-semibold text-white">Köpandel.se</dt>
              <dd className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 leading-7 text-gray-300">
                {kopandelButtons.length ? (
                  kopandelButtons.map((button, index) => (
                    <a
                      key={`link-${button.id}-${button.url}-${index}`}
                      href={button.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white"
                    >
                    </a>
                  ))
                ) : (
                  <span>{kopandelLoaded ? "Kunde inte hämta länk" : "Laddar länkar..."}</span>
                )}
              </dd>
            </div>

            <div className="flex flex-col items-center">
              <a
                href="mailto:travanalys@gmail.com"
                className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20 shadow-sm hover:ring-indigo-400/60 hover:shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5"
              >
                <EnvelopeIcon
                  className="h-8 w-8 text-white"
                  aria-hidden="true"
                />
              </a>
              <dt className="mt-4 font-semibold text-white">Mejla</dt>
              <dd className="mt-2 leading-7 text-gray-400">
                <a
                  href="mailto:travanalys@gmail.com"
                  className="text-gray-300 hover:text-white"
                >
                  travanalys@gmail.com
                </a>
              </dd>
            </div>

            <div className="flex flex-col items-center sm:mt-4">
              <a
                href="https://www.facebook.com/profile.php?id=61555396035366"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20 shadow-sm hover:ring-indigo-400/60 hover:shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5"
              >
                <FaFacebook
                  className="h-8 w-8 text-white"
                  aria-hidden="true"
                />
              </a>
              <dt className="mt-4 font-semibold text-white">Facebook</dt>
              <dd className="mt-2 leading-7 text-gray-300">
                <a
                  href="https://www.facebook.com/profile.php?id=61555396035366"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white"
                ></a>
              </dd>
            </div>
            <div className="flex flex-col items-center sm:mt-4">
              <a
                href="/TravanalysCounterV2.apk"
                download 
                className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20 shadow-sm hover:ring-indigo-400/60 hover:shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5"
              >
                <ArrowDownTrayIcon
                  className="h-8 w-8 text-white"
                  aria-hidden="true"
                />
              </a>
              <dt className="mt-4 font-semibold text-white">Ladda ner appen</dt>
              <dd className="mt-2 leading-7 text-gray-300">
                <a
                  href="/TravanalysCounterV2.apk"
                  download 
                  className="text-gray-300 hover:text-white"
                >
                  Endast för Android
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div
        className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6"
        aria-hidden="true"
      >
        <div
          className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#f1aac8] to-[#776ef3] opacity-30"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>
    </div>
  );
}
