import { DocumentTextIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false); 
  const hideTimer = useRef();

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
            (data && (data.message || data.error)) || "Misslyckades att spara uppgifter"; 
          setMessage(serverMsg); 
        } 
        return; 
      } 

      // OK-svar 
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
              <a
               href="https://www.atg.se/kopandel/spel/325442_V85_2026-02-14_6_5"
                className="rounded-md bg-white/5 p-2 ring-1 ring-white/10 hover:bg-white/10"
              >
                <DocumentTextIcon className="h-8 w-8 text-white" aria-hidden="true" />{" "}
              </a>
              <dt className="mt-4 font-semibold text-white">Köpandel.se</dt>
              <dd className="mt-2 leading-7 text-gray-300">
                <a
                  href="https://www.atg.se/kopandel/spel/325442_V85_2026-02-14_6_5"
                  className="text-gray-300 hover:text-white"
                >
                  travanalys.se
                </a>
              </dd>
            </div>

            <div className="flex flex-col items-center">
              <a
                href="mailto:travanalys@gmail.com"
                className="rounded-md bg-white/5 p-2 ring-1 ring-white/10 hover:bg-white/10"
              >
                <EnvelopeIcon
                  className="h-8 w-8 text-white"
                  aria-hidden="true"
                />{" "}
              </a>
              <dt className="mt-4 font-semibold text-white">Mejla oss</dt>
              <dd className="mt-2 leading-7 text-gray-400">
                <a
                  href="mailto:travanalys@gmail.com"
                  className="text-gray-300 hover:text-white"
                >
                  travanalys@gmail.com
                </a>
              </dd>
            </div>

            <div className="flex flex-col items-center">
              {" "}
              <a
                href="https://www.facebook.com/profile.php?id=61555396035366"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-white/5 p-2 ring-1 ring-white/10 hover:bg-white/10"
              >
                <FaFacebook className="h-8 w-8 text-white" aria-hidden="true" />{" "}
              </a>
              <dd className="mt-2 leading-7 text-gray-300">
                <a
                  href="https://www.facebook.com/profile.php?id=61555396035366"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white"
                ></a>
              </dd>
            </div>
            <div className="flex flex-col items-center">
              {" "}
              <a
                href="https://www.facebook.com/profile.php?id=61555396035366"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-white/5 p-2 ring-1 ring-white/10 hover:bg-white/10"
              >
                <FaInstagram
                  className="h-8 w-8 text-white"
                  aria-hidden="true"
                />{" "}
              </a>
              <dd className="mt-2 leading-7 text-gray-300">
                <a
                  href="https://www.facebook.com/profile.php?id=61555396035366"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white"
                ></a>
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
