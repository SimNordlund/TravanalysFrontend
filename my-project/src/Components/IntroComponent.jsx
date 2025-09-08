import {
  CloudArrowUpIcon,
  UserGroupIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from "@heroicons/react/20/solid";
import vinst1 from "../Bilder/Vinst2.jpg";
import skräll1 from "../Bilder/skräll1.png";
import skräll2 from "../Bilder/skräll2.png";
import skräll3 from "../Bilder/skräll3.png";

const features = [
  {
    name: "Grafiskt beslutsunderlag",
    description:
      "Konsumera det grafiska beslutsunderlaget från den övergripande summeringen till olika djupdykningar i detaljer. Summeringen och analysperspektiven bryts ner i olika delanalyser som ofta skvallrar om en kommande bra prestation.",
    icon: CloudArrowUpIcon,
  },
  {
    name: "För spelare, kusk, tränare och ägare",
    description:
      "Analysverktyget kan användas av travsportens alla intressenter och roller. Fungerar som spelarens stöd för att lägga till eller ta bort en häst - eller bekräfta sin spelidé. Tränarnas och ägarnas stöd i anmälningsprocessen då analyser för propositioner även kommer presenteras.",
    icon: UserGroupIcon,
  },
  {
    name: "Ta hjälp av Trav-olta",
    description: "Vi har även en travkunnig och finurlig AI-kompis kallad Trav-olta som gärna hjälper till med analysen.",
    icon: ChatBubbleOvalLeftEllipsisIcon,
  },
];

const slides = [skräll1, skräll2, skräll3];

export default function IntroComponent() {
  return (
    <div className="overflow-hidden bg-white pt-6 pb-0 sm:pt-10 sm:pb-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-0">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 xl:mx-0 xl:max-w-none xl:grid-cols-2">
          <div className="lg:mt-6 lg:pr-8">
            <div className="lg:max-w-lg">
              <h3 className="text-base/7 font-semibold text-orange-600">
                BETA-version!
              </h3>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
                Travsportens beslutsunderlag
              </p>
              {/* <p className="mt-6 sm:mt-4 text-lg/8 text-gray-600">
                Utnyttja verktyget för att hitta vinnarna. Utforska vår
                Skräll-detector. Konsumera via diagram, tabell eller fördjupad
                analys.
              </p> */}
              <dl className="mt-6 max-w-xl space-y-6 text-base/7 text-gray-600 lg:max-w-none">
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
            </div>
          </div>
          <img
            alt="Product screenshot"
            src={vinst1}
            width={2432}
            height={1442}
            className="hidden md:block w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 md:w-[53rem] md:-ml-24 xl:-ml-24 mt-16"
          />
        </div>
      </div>
    </div>
  );
}
