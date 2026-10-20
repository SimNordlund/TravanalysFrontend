import React, { useState } from "react";
import Swish from "./Components/Swish";
import LikeButton from "./Components/LikeButton";

const includedFeatures = [
  "Unik statistik",
  "Skräll-detektor",
  "Analyser och beslutsunderlag",
  "Tillgång till medlemsforum",
];

export default function Pricing() {
  const [copyStatus, setCopyStatus] = useState(
    "Klicka för att kopiera 070-649 37 63"
  );

  const handleCopyClick = () => {
    navigator.clipboard.writeText("070-6493763");
    setCopyStatus("Nummer kopierat!");
    setTimeout(() => setCopyStatus("Klicka för att kopiera 070-6493763"), 5000);
  };

  return (
    <section aria-labelledby="like-travanalys-title" className="bg-white px-3 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="relative isolate overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-6 py-8 shadow-[0_12px_36px_-24px_rgba(30,41,59,0.26)] sm:px-10 sm:py-10">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 -z-10 h-64 w-64 rounded-full bg-indigo-100/50 blur-3xl" />
          <div className="flex flex-col items-start gap-7 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
            <div className="max-w-xl text-left">
              <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
                <span aria-hidden="true" className="h-1 w-6 rounded-full bg-indigo-500" />
                Ditt stöd gör skillnad
              </p>
              <h2 id="like-travanalys-title" className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Gilla travanalys.se<span className="text-indigo-500">.</span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Har du nytta av våra analyser? Ge oss en tumme upp och lite extra
                energi att fortsätta utveckla Travanalys.
              </p>
            </div>
            <LikeButton />
          </div>
        </div>

        {/*  
        <div className="mx-auto mt-6 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-8 sm:mb-6 lg:mx-0 lg:flex lg:max-w-none shadow-md">
          <div className="p-8 sm:p-10 lg:flex-auto">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">
              Bli en i gänget idag:
            </h3>
            <div className="mt-10 flex items-center gap-x-4">
              <h4 className="flex-none text-sm font-semibold leading-6 text-indigo-600">
                Vad ingår?
              </h4>
              <div className="h-px flex-auto bg-gray-100"></div>
            </div>
            <ul
              role="list"
              className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6"
            >
              {includedFeatures.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <CheckIcon
                    className="h-6 w-5 flex-none text-indigo-600"
                    aria-hidden="true"
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
            <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
              <div className="mx-auto max-w-xs px-8">
                <p className="text-base font-semibold text-gray-600">
                  Stötta oss:
                </p>
                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900">
                    10
                  </span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">
                    KR
                  </span>
                </p>
                <Swish></Swish>
                <a
                  onClick={handleCopyClick}
                  className="block cursor-pointer text-gray-600 hover:underline"
                >
                  {copyStatus}
                </a>
                <p className="mt-6 text-xs leading-5 text-gray-600 ">
                  Stötta travanalys.se med valfri slant via Swish.
                </p>
              </div>
            </div>
          </div>
        </div> */}

      </div>
    </section>
  );
}
