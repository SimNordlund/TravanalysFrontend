// IntroWithCarousel.jsx
import {
  AcademicCapIcon,
  BeakerIcon,
  HeartIcon,
  GlobeAltIcon,
} from "@heroicons/react/20/solid";
import HeroCarousel from "../Components/HeroCarousel";
import skräll1 from "../Bilder/skräll1.png";
import skräll2 from "../Bilder/skräll2.png";
import skräll3 from "../Bilder/skräll3.png";

const features = [
  {
    name: "Vår analysmodell",
    // Changed!
    description: (
      <ul className="mt-1 list-disc pl-5 space-y-1">
        {" "}
        <li>
          Form - hästens prestationer ur olika perspektiv i en närtid.
        </li>{" "}
        <li>
          Fart - hästens tider över olika distanser, spår, kusk, bana och
          underlag.
        </li>{" "}
        <li>Plac - hästens placeringar från det valda analysunderlaget.</li>{" "}
        <li>
          Prest - Den bedömda prestationen som inte alltid är placeringen.
        </li>{" "}
        <li>
          Motst - Alltid svårare och en merit att tävla mot hårt motstånd.
        </li>{" "}
        <li>Klass - Oftast mer utmanande att tävla i höga prisklasser.</li>{" "}
        <li>Skrik - Trender som skvallrar om kommande bra prestationer.</li>{" "}
        <li>
          Analys - Den sammansatta vinstchansen visualiserad i ett
          stapeldiagram.
        </li>{" "}
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
  //  {
  //    name: "Navigering.",
  //    description:
  //      "Klicka på en häst i stapeldiagrammet för att utforska de sju olika analysperspektiven. Markera en eller flera hästar inför beslut om att lägga till eller ta bort en häst.",
  //    icon: GlobeAltIcon,
  //  },
  // { name: "Kostnadsfritt.", description: "Vi utvecklar dessa folkliga tjänster tillsammans. Ditt bidrag är din feedback.", icon: HeartIcon },
];

const slides = [skräll1, skräll2, skräll3];

export default function IntroWithCarousel() {
  return (
    <div className="overflow-hidden bg-white pt-4 pb-0 sm:pt-4 sm:pb-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-10 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          {/* Karusell-kolumn: vänster på stora skärmar */}
          <div className="order-2 lg:order-1 flex items-center">
            {" "}
            <HeroCarousel
              slides={slides}
              auto
              interval={4000}
              className="mt-5 sm:mt-5 mb-10 sm:mb-0 mx-auto w-full max-w-[clamp(18rem,100vw,48rem)] px-0 sm:px-0" // Changed!
              heightClass="aspect-[3/4] sm:aspect-[3/4] lg:h-[620px] lg:aspect-auto" // Changed!
              roundedClass="rounded-xl ring-1 ring-gray-200 shadow-lg"
              fit="contain"
              imgClassName="px-3 md:px-0 pt-0 py-1 md:py-7"
              letterboxBg="bg-slate-100"
            />
          </div>

          {/* Text-kolumn: höger på stora skärmar */}
          <div className="order-1 lg:order-2 lg:pl-8 hidden md:block">
            {" "}
            {/* //Changed! (göm på mobil, visa från md) */}
            <div className="lg:max-w-lg">
              {/*  <h2 className="text-base/7 font-semibold text-indigo-600">
                En analys på riktigt
              </h2> */}
              <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
                Olika analysperspektiv
              </p>

              <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <feature.icon
                        aria-hidden="true"
                        className="absolute top-1 left-1 size-5 text-indigo-600"
                      />
                      {feature.name}
                    </dt>{" "}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
