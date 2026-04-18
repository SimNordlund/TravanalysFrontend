import { Disclosure } from "@headlessui/react";
import {
  ChatBubbleOvalLeftEllipsisIcon,
  ChevronDownIcon,
  EnvelopeIcon,
  SparklesIcon,
} from "@heroicons/react/20/solid";

const faqsList = [
  {
    q: "Vad är travanalys.se?",
    a: "Travanalys.se är travsportens beslutsunderlag. Vi analyserar hästar och visualiserar underlaget så att du snabbare kan jämföra form, fart, prestation och andra analysperspektiv.",
  },
  {
    q: "Hur använder jag travanalys.se?",
    a: "Börja i Analys för den samlade bilden, gå vidare till Ranking när du vill jämföra fältet och använd Spel & ROI när du vill titta närmare på spelvärde och historik.",
  },
  {
    q: "Kostar det något?",
    a: "Nej, travanalys.se är gratis att använda. Tjänsten är fortfarande under utveckling och fler funktioner kommer att fyllas på efter hand.",
  },
  {
    q: "Vilka ligger bakom travanalys.se?",
    a: "Vi är ett gäng travnördar som vill göra det enklare att hitta intressanta hästar, ifrågasätta magkänslan och fatta bättre beslut inför loppen.",
  },
  {
    q: "Vem är Trav-olta?",
    a: "Trav-olta är vår AI-baserade travkompis. Du hittar honom i chatboxen längst ner till höger. Han är i beta, men kan hjälpa till med frågor om startlistor, odds, ROI och analys.",
  },
  {
    q: "Hur kontaktar jag er?",
    a: "Kontaktuppgifter finns längst ner på sidan. Hör gärna av dig med frågor, felrapporter eller idéer på sådant som skulle göra analysen ännu vassare.",
  },
];

const supportItems = [
  {
    title: "Beta-version",
    text: "Saker kan röra på sig medan vi bygger vidare. Feedback hjälper oss att prioritera rätt.",
    icon: SparklesIcon,
  },
  {
    title: "Trav-olta hjälper till",
    text: "Testa chatten om du vill fråga om analysen, lopp eller hur du kan tolka underlaget.",
    icon: ChatBubbleOvalLeftEllipsisIcon,
  },
  {
    title: "Saknar du något?",
    text: "Skicka din feedback. Bra frågor blir ofta bättre funktioner.",
    icon: EnvelopeIcon,
  },
];

const Faqs = () => {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-base/7 font-semibold text-orange-600">
            Frågor & svar
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Vad vill du veta?
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base/7 text-gray-600 sm:text-lg/8">
            Här hittar du de vanligaste frågorna om travanalys.se,
            analysvyerna och Trav-olta.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
          <aside className="rounded-xl bg-gray-900 p-6 text-white shadow-xl ring-1 ring-gray-900/10">
            <h2 className="text-2xl font-semibold tracking-tight">
              Snabb hjälp
            </h2>
            <p className="mt-3 text-sm/6 text-gray-300">
              Travanalys är byggt för att ge ett tydligare beslutsunderlag,
              inte för att ersätta din egen spelidé.
            </p>

            <div className="mt-8 space-y-6">
              {supportItems.map((item) => (
                <div key={item.title} className="relative pl-9">
                  <item.icon
                    aria-hidden="true"
                    className="absolute left-0 top-1 size-5 text-indigo-300"
                  />
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm/6 text-gray-300">{item.text}</p>
                </div>
              ))}
            </div>
          </aside>

          <div className="space-y-3">
            {faqsList.map((item, idx) => (
              <Disclosure
                as="div"
                key={item.q}
                defaultOpen={idx === 0}
                className="rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-indigo-200 hover:shadow-md"
              >
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex w-full items-start justify-between gap-x-4 px-5 py-4 text-left">
                      <span className="text-base font-semibold text-gray-900 sm:text-lg">
                        {item.q}
                      </span>
                      <ChevronDownIcon
                        aria-hidden="true"
                        className={`mt-1 size-5 flex-none text-indigo-600 transition-transform duration-200 ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-5 pb-5 text-sm/6 text-gray-600 sm:text-base/7">
                      {item.a}
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Faqs;
