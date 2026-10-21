import { Disclosure } from "@headlessui/react";
import { ArrowRight, ChevronDown, Mail, MessageCircle, SlidersHorizontal, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

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
    q: "Vad är Travanalys Reducering?",
    a: "Travanalys Reducering hjälper dig att bygga reducerade system utifrån dina egna val och villkor. Du väljer spelform, datum, bana och lopp, fyller i hästar per avdelning och sätter regler för exempelvis rank och exkluderade textrader. Verktyget ersätter inte din spelidé, utan hjälper dig att göra systemet mer hanterbart.",
  },
  {
    q: "Kan jag skapa en reducerad spelfil?",
    a: "Ja, helt gratis. När reduceringen är klar kan du förhandsgranska raderna och sedan ladda ner en XML-spelfil eller kopiera länken till filen. Filen skapas utifrån samma reduceringsvillkor som du har valt i formuläret. Observera att det är en beta-version så var noga med att granska filen innan du skickar in den till ATG. Vi tar inget ansvar för eventuella fel i filen.",
  },
  {
    q: "Vilka ligger bakom travanalys.se?",
    a: "Travanalys.se utvecklas och drivs av NICNOR AB (org.nr 556990-1837). Vi vill göra det enklare att hitta intressanta hästar, ifrågasätta magkänslan och fatta bättre beslut inför loppen.",
  },
  {
    q: "Kostar det något?",
    a: "Grundfunktionerna på travanalys.se är för närvarande gratis. Om vi inför betalfunktioner eller abonnemang kommer pris, innehåll, betalningsintervall och villkor alltid att visas tydligt innan köp.",
  },
  {
    q: "Vem är Trav-olta?",
    a: "Trav-olta är vår AI-baserade travkompis. Du hittar honom i chatboxen längst ner till höger. Han är i beta, men kan hjälpa till med frågor om startlistor, odds, ROI och analys.",
  },
  {
    q: "Hur kontaktar jag er?",
    a: "Mejla travanalys@gmail.com med frågor, felrapporter eller idéer. Företagsuppgifter och fullständiga kundvillkor finns på sidan Om oss.",
  },
];

const supportItems = [
  {
    title: "Beta-version",
    text: "Saker kan röra på sig medan vi bygger vidare. Feedback hjälper oss att prioritera rätt.",
    icon: Sparkles,
    iconClassName: "border-amber-100 bg-amber-50 text-amber-700",
  },
  {
    title: "Trav-olta hjälper till",
    text: "Testa chatten om du vill fråga om analysen, lopp eller hur du kan tolka underlaget.",
    icon: MessageCircle,
    iconClassName: "border-indigo-100 bg-indigo-50 text-indigo-600",
  },
  {
    title: "Reducering",
    text: "Skapa reducerade system utifrån dina egna val. Spelform, villkor och regler kan du själv bestämma.",
    icon: SlidersHorizontal,
    iconClassName: "border-teal-100 bg-teal-50 text-teal-700",
  },
  {
    title: "Saknar du något?",
    text: "Skicka din feedback. Bra frågor blir ofta bättre funktioner.",
    icon: Mail,
    iconClassName: "border-sky-100 bg-sky-50 text-sky-700",
  },
];

const Faqs = () => {
  return (
    <main className="min-w-0 bg-slate-50 px-3 py-8 text-left text-slate-700 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8 px-1 sm:mb-10">
          <p className="mb-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
            <span className="h-1 w-6 rounded-full bg-indigo-500" aria-hidden="true" />
            Frågor & svar
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Vad vill du veta<span className="text-indigo-500">?</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
            Här hittar du svar om analysen, reduceringen och hur du kommer igång med Travanalys.
          </p>
        </header>

        <div className="grid min-w-0 items-start gap-5 sm:gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <aside className="analytics-section order-2 lg:order-1" aria-labelledby="faq-help-title">
            <h2 id="faq-help-title" className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              Snabb hjälp
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Travanalys är byggt för att ge ett tydligare beslutsunderlag,
              inte för att ersätta din egen spelidé.
            </p>

            <div className="mt-5 divide-y divide-slate-100">
              {supportItems.map((item) => (
                <div key={item.title} className="flex items-start gap-3 py-4 first:pt-0">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${item.iconClassName}`} aria-hidden="true">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-800">{item.title}</h3>
                    <p className="mt-1 text-sm leading-7 text-slate-500">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 flex flex-col items-start gap-3 border-t border-slate-100 pt-5">
              <a
                href="mailto:travanalys@gmail.com"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-indigo-600 bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:from-indigo-700 hover:to-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                Mejla oss
              </a>
              <Link
                to="/about"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg text-xs font-semibold text-slate-600 transition-colors hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                Om oss och våra villkor
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>

          <div className="order-1 min-w-0 space-y-3 lg:order-2">
            {faqsList.map((item, idx) => (
              <Disclosure
                as="div"
                key={item.q}
                defaultOpen={idx === 0}
                className="analytics-section overflow-hidden !p-0"
              >
                {({ open }) => (
                  <>
                    <Disclosure.Button className={`flex min-h-16 w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-indigo-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400 motion-reduce:transition-none sm:px-5 ${open ? "bg-indigo-50/60" : ""}`}>
                      <span className="min-w-0 flex-1 text-sm font-semibold leading-6 text-slate-800">
                        {item.q}
                      </span>
                      <ChevronDown
                        aria-hidden="true"
                        className={`h-4 w-4 shrink-0 text-indigo-500 transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="border-t border-slate-100 px-4 py-4 text-sm leading-7 text-slate-500 sm:px-5">
                      {item.a}
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Faqs;
