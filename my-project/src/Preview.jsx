/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/aspect-ratio'),
    ],
  }
  ```
*/
const callouts = [
  {
    name: 'V75',
    description: 'Solvalla',
    href: '#',
    bgColor: 'bg-blue-500',
  },
  {
    name: 'V86',
    description: 'Knuthöjden',
    href: '#',
    bgColor: 'bg-purple-500',
  },
  {
    name: 'V64',
    description: 'Bjerke',
    href: '#',
    bgColor: 'bg-orange-500',
  },
];

export default function Example() {
  return (
    <div className="bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:max-w-none lg:py-32">
          <h2 className="text-2xl font-bold text-gray-900">Bäst i samtliga spel</h2>

          <div className="mt-6 space-y-12 lg:grid lg:grid-cols-3 lg:gap-x-6 lg:space-y-0">
            {callouts.map((callout) => (
              <div key={callout.name} className="group relative">
                <div className={`${callout.bgColor} relative h-80 w-full overflow-hidden rounded-lg sm:aspect-h-1 sm:aspect-w-2 lg:aspect-h-1 lg:aspect-w-1 flex items-center justify-center group-hover:opacity-75 transition-opacity duration-300`}>
                  {/* Ensure text inside this div is initially white and changes if needed */}
                  <div className="text-center">
                    <h3 className="text-8xl font-semibold text-grey-900">{callout.name}</h3>
                    <p className="mt-2 text-xl text-white">{callout.description}</p>
                  </div>
                </div>
                <h3 className="mt-6 text-sm text-gray-500">
                  <a href={callout.href}>
                    <span className="absolute inset-0" />
                    {callout.name}
                  </a>
                </h3>
                <p className="text-base font-semibold text-gray-900">{callout.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}




