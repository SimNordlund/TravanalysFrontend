const callouts = [
  {
    id: 1,
    name: 'V75',
    description: 'Solvalla',
    bgColor: 'bg-blue-500',
  },
  {
    id: 2,
    name: 'V86',
    description: 'Romme',
    bgColor: 'bg-purple-500',
  },
  {
    id: 3,
    name: 'V64',
    description: 'Färjestad',
    bgColor: 'bg-orange-500',
  },
];

export default function Preview({ onCompetitionSelect }) {
  const handleButtonClick = (id) => {
    onCompetitionSelect(id); // Select the competition
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to the top of the page
  };

  return (
    <div className="bg-gray-100">
      <div className="mx-10 max-w-1xl">
        <div className="mx-auto max-w-2xl py-1 sm:py-10 lg:max-w-none lg:py-16">
          <div className="mt-14 mb-14 lg:mb-0 lg:mt-0 lg:grid lg:grid-cols-3 lg:gap-x-6 lg:space-y-0 grid grid-cols-3 gap-x-6">
            {callouts.map((callout) => (
              <div
                key={callout.id}
                className="group relative cursor-pointer"
                onClick={() => handleButtonClick(callout.id)} // Call handleButtonClick
              >
                <div
                  className={`${callout.bgColor} relative h-80 w-full overflow-hidden rounded-lg sm:aspect-h-1 sm:aspect-w-2 lg:aspect-h-1 lg:aspect-w-1 flex items-center justify-center group-hover:opacity-75 transition-opacity duration-300 shadow-lg`}
                >
                  <div className="text-center">
                    <h3 className="text-4xl font-semibold text-grey-900">{callout.name}</h3>
                    <p className="mt-2 text-xl text-white">{callout.description}</p>
                  </div>
                </div>
                <h3 className="mt-6 text-sm text-gray-500">{callout.name}</h3>
                <p className="text-base font-semibold text-gray-900">{callout.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
