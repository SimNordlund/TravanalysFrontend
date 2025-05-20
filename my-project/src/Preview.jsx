const callouts = [
  {
    id: 1,
    name: 'V75',
    description: 'Solvalla',
    bgColor: 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600',
  },
  {
    id: 2,
    name: 'V86',
    description: 'Romme',
    bgColor: 'bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600',
  },
  {
    id: 3,
    name: 'V64',
    description: 'Färjestad',
    bgColor: 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600',
  },
];

export default function Preview({ onCompetitionSelect }) {
  const handleButtonClick = (id, name) => {
    onCompetitionSelect(id, name); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  return (
    <div className="bg-gray-100">
      <div className="mx-4 max-w-1xl">
        <div className="mx-auto max-w-1x4 py-1 sm:py-10 lg:max-w-none lg:py-16">
          <div className="mt-12 mb-12 lg:mb-0 lg:mt-0 flex justify-center lg:gap-x-10 gap-x-6 flex-wrap">
            {callouts.map((callout) => (
              <div
                key={callout.id}
                className="group relative cursor-pointer"
                onClick={() => handleButtonClick(callout.id, callout.name)}
              >
                <div
                  className={`${callout.bgColor} relative h-24 w-24 sm:w-72 sm:h-28 overflow-hidden rounded-lg lg:aspect-h-1 lg:aspect-w-1 flex items-center justify-center group-hover:opacity-65 transition-opacity duration-300 shadow-xl`}
                >
                  <div className="text-center">
                    <h3 className="text-4xl font-semibold text-white">{callout.name}</h3>
                    <p className="mt-2 text-xl text-white">{callout.description}</p>
                  </div>
                </div>
                <h3 className="mt-4 text-sm text-gray-500 text-center">{callout.name}</h3>
                <p className="text-base font-semibold text-gray-900 text-center">{callout.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
