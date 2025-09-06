
import {
  AcademicCapIcon,
  BeakerIcon,
  HeartIcon,
  GlobeAltIcon,
} from "@heroicons/react/20/solid";
import { useState } from "react"; 
import HeroCarousel from "../Components/HeroCarousel";
import skräll1 from "../Bilder/skräll1.png";
import skräll2 from "../Bilder/skräll2.png";
import skräll3 from "../Bilder/skräll3.png";

const features = [
  {
    name: "Vår analysmodell",
    description: (
      <ul className="mt-1 list-disc pl-3 space-y-0.5">
        <li>Form - Hästens prestationer ur olika perspektiv i en närtid.</li>
        <li>Fart - Hästens presterade tider över olika distanser med hänsyn till banunderlag, startspår och kusk.</li>
        <li>Placering - Hästens placeringar från det valda analysunderlaget.</li>
        <li>Prestation - En analys och översättning till en moralisk placering.</li>
        <li>Motstånd - Alltid svårare och meriterande att tävla mot hårt motstånd.</li>
        <li>Klass - Oftast mer utmanande att tävla i höga prisklasser.</li>
        <li>Skrik - Trender i analysunderlag och spekulationer som skvallrar om dold form.</li>
        <li>Analys - Den sammansatta vinstchansen visualiserad i ett stapeldiagram.</li>
      </ul>
    ),
    icon: AcademicCapIcon,
  },
  {
    name: "Konsumtion av beslutsunderlaget",
    description:
      "De sju olika analysperspektiven visualiseras i ett spindeldiagram som tillsammans bildar ett totalt analysutfall i ett stapeldiagram. Högst stapel har högst vinstchans. Uppstickare hittas i spindeldiagrammets sju analysperspektiv som tillsammans kanske inte alltid innebär högst total.",
    icon: BeakerIcon,
  },
  {
    name: "Navigering",
    description:
      "Klicka på en häst i stapeldiagrammet för att utforska de sju olika analysperspektiven. Markera en eller flera hästar inför beslut om att lägga till eller ta bort en häst.",
    icon: GlobeAltIcon,
  },
  // { name: "Kostnadsfritt.", description: "Vi utvecklar dessa folkliga tjänster tillsammans. Ditt bidrag är din feedback.", icon: HeartIcon },
];

const slides = [skräll1, skräll2, skräll3];

export default function IntroWithCarousel() {
  const [isOpen, setIsOpen] = useState(false); 

  return (
    <div className="overflow-hidden bg-white pt-4 pb-0 sm:pt-4 sm:pb-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-0">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 sm:gap-y-10 lg:mx-0 lg:max-w-none lg:grid-cols-2">
         
          <div className="order-1 lg:order-1 flex items-center">
            <HeroCarousel
              slides={slides}
              auto
              interval={4000}
              className="mt-10 sm:mt-5 mb-0 sm:mb-0 mx-auto w-full max-w-[clamp(18rem,100vw,48rem)] px-0 sm:px-0" 
              heightClass="aspect-[3/4] sm:aspect-[3/4] lg:h-[620px] lg:aspect-auto" 
              roundedClass="rounded-xl ring-1 ring-gray-200 shadow-lg"
              fit="contain"
              imgClassName="px-3 md:px-0 pt-0 py-1 md:py-7"
              letterboxBg="bg-slate-100"
            />
          </div>

        
          <div className="order-2 lg:order-2 lg:pl-11">
            <div className="lg:max-w-lg relative"> 
              <p className="mt-3 sm:mt-2 text-4xl mb-2 sm:mb-0 font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
                Analysperspektiven
              </p>

            
              <div
                className={
                  
                  `relative transition-[max-height] duration-300 ease-in-out
                  ${isOpen ? "max-h-[9999px]" : "max-h-56 overflow-hidden"}
                  md:max-h-none md:overflow-visible`
                }
              >
                <dl className="mt-5 mb-6 sm:mb-0 max-w-xl space-y-6 text-base/7 text-gray-600 lg:max-w-none">
                  {features.map((feature) => (
                    <div key={feature.name} className="relative pl-9">
                      <dt className="block font-semibold text-gray-900">
                        <feature.icon
                          aria-hidden="true"
                          className="absolute top-1 left-1 size-5 text-indigo-600"
                        />
                        {feature.name}
                      </dt>{" "}
                      <dd className="block">{feature.description}</dd>
                    </div>
                  ))}
                </dl>

            
                {!isOpen && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white to-white/0 md:hidden" /> 
                )}
              </div>

              
              <div className="md:hidden mt-2 mb-6"> 
                <button
                  type="button"
                  onClick={() => setIsOpen((v) => !v)} 
                  className="text-indigo-600 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                >
                  {isOpen ? "Visa mindre" : "Visa mer"} 
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
