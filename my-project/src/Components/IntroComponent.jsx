import { CloudArrowUpIcon, LockClosedIcon, ServerIcon } from '@heroicons/react/20/solid'
import vinst1 from '../Bilder/Vinst1.jpg';

const features = [
  {
    name: 'Överlägset beslutsunderlag. ',
    description:
      'Nyttja vår kraftfulla algoritm via statistik och reducerade system. Utforska underlaget i den form som passar dig.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Spelare, Ägare, Kuskar, Tränare. ',
    description: 'Går att användas av alla travtokar! Spelare som kusk. Scrolla ner och prova.',
    icon: LockClosedIcon,
  },
  {
    name: 'Kostnadsfritt. ',
    description: 'Kostnadsfritt i under utvecklingsfasen. Använd hur mycket du vill, passa på att vässa din kunskap inför kommande lopp.',
    icon: ServerIcon,
  },
]

export default function IntroComponent() {
  return (
    <div className="overflow-hidden bg-white pt-6 pb-10 sm:pt-16 sm:pb-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pt-4 lg:pr-8">
            <div className="lg:max-w-lg">
              <h2 className="text-base/7 font-semibold text-indigo-600">Överlägsen statistik</h2>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
              Skrällarsytt underlag
              </p>
              <p className="mt-6 text-lg/8 text-gray-600">
                Utnyttja verktyget för att hitta skrällarna. Nedan kan du utforska vår Skräll-detector. Välj mellan tabell, diagram eller fördjupad analys.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <feature.icon aria-hidden="true" className="absolute top-1 left-1 size-5 text-indigo-600" />
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline">{feature.description}</dd>
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
            className="hidden sm:block w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-24 lg:-ml-24"

          />
        </div>
      </div>
    </div>
  )
}
