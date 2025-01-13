const callouts = [
  {
    id: 1,
    name: 'Reducerat System',
    bgColor: 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600',
    href: '/Components/ReducedButtons', // Fixed typo from hfref to href
  },
  {
    id: 2,
    name: 'Diagram',
    bgColor: 'bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600',
    href: '/Tables',
  },
  {
    id: 3,
    name: 'Tabeller',
    bgColor: 'bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600',
    href: '/ChartPage',
  },
];

export default function CalloutButtons() {
  return (
    <div className="bg-white">
      <div className="mx-4 max-w-1xl">
        <div className="mx-auto max-w-1x4 py-1 sm:py-10 lg:max-w-none lg:py-4">
          <div className="mb-2 lg:mb-0 lg:mt-0 flex justify-center lg:gap-x-10 gap-x-6 flex-wrap">
            {callouts.map((callout) => (
              <div
                key={callout.id}
                className="group relative cursor-pointer"
                onClick={() => window.location.href = callout.href} // Navigate to href on click
              >
                <div
                  className={`${callout.bgColor} relative h-24 w-24 sm:w-72 sm:h-28 overflow-hidden rounded-lg lg:aspect-h-1 lg:aspect-w-1 flex items-center justify-center group-hover:opacity-65 transition-opacity duration-300 shadow-xl`}
                >
                  <div className="text-center">
                    <h3 className=" sm:text-3xl font-semibold text-white">{callout.name}</h3>
                  </div>
                </div>
                <p className="text-base font-semibold text-gray-900 text-center">{callout.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
