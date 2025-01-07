import picke2 from '../Bilder/picke2.png';
import FAQComponent from '../Components/FAQComponent';
import NewsLetter from '../Newsletter';

export default function Example() {
  return (
    <div>
    <section className="px-6 py-12 sm:py-14 lg:px-8 bg-gray-100">
                  <img
              alt=""
              src={picke2}
              className="mt-0 mx-auto h-41 w-40 rounded-full"
            />
      <div className="mx-auto max-w-2xl lg:max-w-4xl">
        <figure className="mt-10 ">
          <blockquote className="text-center text-xl font-semibold leading-8 text-gray-900 sm:text-2xl sm:leading-9">
            <p>
              “Hellre en Arboga i Kläppen än en Arbogare i stjärten"
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
    <div className="mt-2">
    <FAQComponent/>
    </div>
     <NewsLetter/>
     </div>
  )
}
