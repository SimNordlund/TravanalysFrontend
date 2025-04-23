import React, { useState } from 'react';
import Swish from './Components/Swish';
import { CheckIcon } from '@heroicons/react/20/solid';

const includedFeatures = [
  'Goa Ipas',
  'Tip-Top statistik',
  'Skräll-detektor',
  'Tillgång till medlemsforum',
];

export default function Pricing() {
  const [copyStatus, setCopyStatus] = useState('Klicka för att kopiera 070-6493763');

  const handleCopyClick = () => {
    navigator.clipboard.writeText('070-6493763');
    setCopyStatus('Nummer kopierat!');
    setTimeout(() => setCopyStatus('Klicka för att kopiera 070-6493763'), 5000); // Reset after 2 seconds
  };

  return (
    <div className="bg-white py-6 sm:py-0 sm:mt-2 sm:mb-20 mb-8 mt-2 sm:pt-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mt">
        <div className="mx-auto max-w-2xl sm:text-center text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Viill du stötta gänget på travanalys?</h2>
        </div>
        <div className="mx-auto mt-10 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-8 sm:mb-6 lg:mx-0 lg:flex lg:max-w-none shadow-md">
          <div className="p-8 sm:p-10 lg:flex-auto">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">Bli en i gänget idag:</h3>
            <p className="mt-6 text-base leading-7 text-gray-600">
              Dennis bjuder oftast på stark Åbro.
            </p>
            <div className="mt-10 flex items-center gap-x-4">
              <h4 className="flex-none text-sm font-semibold leading-6 text-indigo-600">Men vad ingår då?</h4>
              <div className="h-px flex-auto bg-gray-100"></div>
            </div>
            <ul
              role="list"
              className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6"
            >
              {includedFeatures.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <CheckIcon className="h-6 w-5 flex-none text-indigo-600" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
            <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
              <div className="mx-auto max-w-xs px-8">
                <p className="text-base font-semibold text-gray-600">Stötta oss:</p>
                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900">10</span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">KR</span>
                </p>
                <Swish></Swish>
                <a
                  onClick={handleCopyClick}
                  className="block cursor-pointer text-gray-600 hover:underline"
                >
                  {copyStatus}
                </a>
                <p className="mt-6 text-xs leading-5 text-gray-600 ">
                  Stötta oss på Travanalys via Swish med en 10:a eller valfri slant.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
