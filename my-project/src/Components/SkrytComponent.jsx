import pappaCrazy from '../Bilder/PappaCrazy.png';

export default function Example() {
  return (
    <section className="isolate overflow-hidden bg-white px-6 py-12 sm:py-16 lg:px-8">
                  <img
              alt=""
              src={pappaCrazy}
              className="mt-0 mx-auto h-41 w-40 rounded-full"
            />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-20" />
      <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />
      <div className="mx-auto max-w-2xl lg:max-w-4xl">
        <figure className="mt-20 ">
          <blockquote className="text-center text-xl font-semibold leading-8 text-gray-900 sm:text-2xl sm:leading-9">
            <p>
              “Hellre Arboga i plätten än en Arbogare i stjärten"
            </p>
          </blockquote>
          <figcaption className="mt-6">
            <div className="mt-1 flex items-center justify-center space-x-3 text-base">
              <div className="font-semibold text-gray-900">Niclas Nordlund</div>
              <svg width={3} height={3} viewBox="0 0 2 2" aria-hidden="true" className="fill-gray-900">
                <circle r={1} cx={1} cy={1} />
              </svg>
              <div className="text-gray-600">Grundare</div>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
