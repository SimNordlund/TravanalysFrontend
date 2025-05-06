import { useState } from "react"; //Changed!
import { PhoneIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";

export default function Newsletter() {
  const [email, setEmail] = useState(""); //Changed!
  const [phone, setPhone] = useState(""); //Changed!
  const [consent, setConsent] = useState(false); //Changed!

  const handleSubmit = async (e) => {
    //Changed!
    e.preventDefault(); //Changed!
    if (!consent) {
      //Changed!
      alert("Du måste godkänna lagring av uppgifter."); //Changed!
      return; //Changed!
    } //Changed!
    if (!email && !phone) {
      //Changed!
      alert("Fyll i mejl, telefonnummer eller båda."); //Changed!
      return; //Changed!
    } //Changed!
    try {
      const payload = {}; //Changed!
      if (email) payload.email = email; //Changed!
      if (phone) payload.phone = phone; //Changed!
      const response = await fetch(
        "http://localhost:8080/travanalys/storePhonenumber",
        {
          //Changed!
          method: "POST", //Changed!
          headers: {
            "Content-Type": "application/json", //Changed!
          },
          body: JSON.stringify(payload), //Changed!
        }
      ); //Changed!
      if (response.ok) {
        console.log("Det gick yo!"); //Changed!
        setEmail(""); //Changed!
        setPhone(""); //Changed!
        setConsent(false); //Changed!
      } else {
        console.error("Misslyckades att spara uppgifter"); //Changed!
      }
    } catch (error) {
      console.error("Error:", error); //Changed!
    }
  }; //Changed!

  return (
    <div className="relative isolate overflow-hidden bg-gray-900 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
          <div className="max-w-xl lg:max-w-lg">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Prenumerera på skräll-detektorn.
            </h2>
            <form
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col gap-y-4"
            >
              {" "}
              {/* Changed! */}
              {/* Email input */}
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                value={email} //Changed!
                onChange={(e) => setEmail(e.target.value)} //Changed!
                className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                placeholder="Skriv in din mejl"
              />
              {/* Phone input */}
              <label htmlFor="phone-number" className="sr-only">
                Phone number
              </label>
              <input
                id="phone-number"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phone} //Changed!
                onChange={(e) => setPhone(e.target.value)} //Changed!
                className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                placeholder="Skriv in ditt telefonnummer"
              />
              {/* Consent checkbox */}
              <div className="flex items-center">
                <input
                  id="consent"
                  name="consent"
                  type="checkbox"
                  checked={consent} //Changed!
                  onChange={(e) => setConsent(e.target.checked)} //Changed!
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  required //Changed!
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
          </div>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 sm:mt-20">
            {/* Phone Icon */}
            <div className="flex flex-col items-center">
              <a
                href="tel:0706493763"
                className="rounded-md bg-white/5 p-2 ring-1 ring-white/10 hover:bg-white/10" //Changed!
              >
                <PhoneIcon className="h-8 w-8 text-white" aria-hidden="true" />{" "}
              </a>
              <dt className="mt-4 font-semibold text-white">Ring oss</dt>
              <dd className="mt-2 leading-7 text-gray-300">
                <a
                  href="tel:0706493763"
                  className="text-gray-300 hover:text-white"
                >
                  070-649 37 63
                </a>
              </dd>
            </div>

            {/* Email Icon */}
            <div className="flex flex-col items-center">
              <a
                href="mailto:travanalys@gmail.com"
                className="rounded-md bg-white/5 p-2 ring-1 ring-white/10 hover:bg-white/10" //Changed!
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

            {/* Facebook Icon */}
            <div className="flex flex-col items-center">
              {" "}
              <a
                href="https://www.facebook.com/profile.php?id=61555396035366"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-white/5 p-2 ring-1 ring-white/10 hover:bg-white/10" //Changed!
              >
                <FaFacebook className="h-8 w-8 text-white" aria-hidden="true" />{" "}
              </a>
              <dt className="mt-4 font-semibold text-white">
                Följ oss på Facebook
              </dt>{" "}
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
              {/* Changed! */}
              <a
                href="https://www.instagram.com/nrdlund/" // Replace with your actual Instagram URL //Changed!
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-white/5 p-2 ring-1 ring-white/10 hover:bg-white/10" //Changed!
              >
                <FaInstagram
                  className="h-8 w-8 text-white"
                  aria-hidden="true"
                />{" "}
              </a>
              <dt className="mt-4 font-semibold text-white">
                Följ oss på Instagram
              </dt>{" "}
              <dd className="mt-2 leading-7 text-gray-300">
                <a
                  href="https://www.instagram.com/nrdlund/" // Replace if needed //Changed!
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white"
                >
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
