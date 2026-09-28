import {
  BuildingOffice2Icon,
  CheckBadgeIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const companyDetails = [
  ["Juridiskt företagsnamn", "NICNOR AB"],
  ["Varumärke och tjänst", "Travanalys.se"],
  ["Organisationsnummer", "556990-1837"],
  ["Postadress", "Lillsängen 1, 712 93 Hällefors, Sverige"],
  ["Säte", "Hällefors kommun, Örebro län"],
];

const serviceFeatures = [
  "Analyser och visualiseringar av svensk travsport",
  "Jämförelser av bland annat form, fart, prestation, ranking och historisk ROI",
  "Verktyg för att skapa och granska reducerade systemfiler utifrån användarens egna val",
  "AI-baserad hjälp för att förstå data, startlistor och analysunderlag",
];

const About = () => {
  return (
    <main className="bg-white text-gray-900">
      <section className="border-b border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-base/7 font-semibold text-orange-600">
              Om Travanalys
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              Tydligare beslutsunderlag för svensk travsport
            </h1>
            <p className="mt-6 text-lg/8 text-gray-600">
              Travanalys.se utvecklas och drivs av NICNOR AB. Tjänsten samlar,
              analyserar och visualiserar travdata för att göra det enklare att
              jämföra hästar och skapa ett eget, välgrundat beslutsunderlag.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-2xl border border-gray-200 p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <BuildingOffice2Icon
                className="size-7 text-indigo-600"
                aria-hidden="true"
              />
              <h2 className="text-2xl font-semibold">Företagsuppgifter</h2>
            </div>
            <dl className="mt-6 divide-y divide-gray-100">
              {companyDetails.map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4"
                >
                  <dt className="font-medium text-gray-900">{label}</dt>
                  <dd className="text-gray-600">{value}</dd>
                </div>
              ))}
              <div className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
                <dt className="font-medium text-gray-900">Kundservice</dt>
                <dd>
                  <a
                    href="mailto:travanalys@gmail.com"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    travanalys@gmail.com
                  </a>
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-2xl bg-gray-900 p-6 text-white shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <CheckBadgeIcon
                className="size-7 text-indigo-300"
                aria-hidden="true"
              />
              <h2 className="text-2xl font-semibold">Det här erbjuder vi</h2>
            </div>
            <p className="mt-5 text-gray-300">
              Travanalys är en digital informations- och analystjänst. Tjänsten
              kan innehålla både kostnadsfria funktioner och funktioner som
              kräver betalning.
            </p>
            <ul className="mt-6 space-y-4">
              {serviceFeatures.map((feature) => (
                <li key={feature} className="flex gap-3 text-gray-200">
                  <CheckBadgeIcon
                    className="mt-0.5 size-5 flex-none text-indigo-300"
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="border-y border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <p className="text-base/7 font-semibold text-orange-600">
              Kundvillkor
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Köp, leverans och återbetalning
            </h2>
            <p className="mt-4 text-gray-600">
              Villkoren nedan gäller när NICNOR AB erbjuder en betald digital
              tjänst på Travanalys.se. Pris, eventuell abonnemangsperiod och vad
              som ingår visas alltid innan ett köp slutförs.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <article className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
              <h3 className="text-xl font-semibold">Beställning och betalning</h3>
              <p className="mt-3 text-sm/6 text-gray-600">
                Kunden får möjlighet att kontrollera tjänst, totalpris,
                betalningsintervall och eventuella skatter innan beställningen
                bekräftas. Betalning sker med den betalmetod som anges i kassan.
                En order- eller betalningsbekräftelse skickas elektroniskt.
              </p>
            </article>

            <article className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
              <h3 className="text-xl font-semibold">Digital leverans</h3>
              <p className="mt-3 text-sm/6 text-gray-600">
                Åtkomst till en köpt digital tjänst ges normalt direkt efter
                bekräftad betalning. Eventuella särskilda tekniska krav eller
                avvikelser i leveranstid visas före köpet. Kontakta kundservice
                om åtkomsten inte aktiveras som utlovat.
              </p>
            </article>

            <article className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
              <h3 className="text-xl font-semibold">Abonnemang och uppsägning</h3>
              <p className="mt-3 text-sm/6 text-gray-600">
                Ett löpande abonnemang förnyas med den period som visas vid
                köpet tills det sägs upp. Uppsägning kan göras genom att mejla
                kundservice och gäller senast från slutet av den redan betalda
                perioden. Ingen ny debitering görs därefter. Eventuell
                bindnings- eller uppsägningstid anges tydligt före köp.
              </p>
            </article>

            <article className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
              <h3 className="text-xl font-semibold">Ångerrätt</h3>
              <p className="mt-3 text-sm/6 text-gray-600">
                En konsument har som huvudregel 14 dagars ångerrätt från den dag
                avtalet ingås på distans. Meddela kundservice skriftligen och
                ange vilken tjänst köpet gäller. Om kunden uttryckligen begär
                att tjänsten ska börja under ångerfristen kan NICNOR AB ha rätt
                till skälig ersättning för den del som redan har levererats.
                För digitalt innehåll kan ångerrätten upphöra först efter
                kundens uttryckliga samtycke och bekräftelse enligt lag.
              </p>
            </article>

            <article className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
              <h3 className="text-xl font-semibold">
                Återbetalning och reklamation
              </h3>
              <p className="mt-3 text-sm/6 text-gray-600">
                Vid godkänd ånger, felaktig debitering eller en tjänst som inte
                levererats enligt avtalet görs återbetalning till samma
                betalningsmetod utan onödigt dröjsmål och, när lagens tidsfrist
                gäller, senast inom 14 dagar. Reklamera så snart som möjligt via
                kundservice och beskriv felet. Detta begränsar inte tvingande
                konsumenträttigheter.
              </p>
            </article>

            <article className="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
              <h3 className="text-xl font-semibold">Tvister och kampanjer</h3>
              <p className="mt-3 text-sm/6 text-gray-600">
                Kontakta oss först så försöker vi lösa ärendet. En konsument kan
                även vända sig till Allmänna reklamationsnämnden på arn.se.
                Svensk lag tillämpas, med förbehåll för tvingande
                konsumentskyddsregler. Villkor och giltighetstid för en kampanj
                visas tillsammans med erbjudandet.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-2xl border border-gray-200 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon
                className="size-7 text-indigo-600"
                aria-hidden="true"
              />
              <h2 className="text-2xl font-semibold">
                Ansvarsfull användning och begränsningar
              </h2>
            </div>
            <div className="mt-5 space-y-4 text-sm/6 text-gray-600">
              <p>
                Travanalys tillhandahåller information, statistik och tekniska
                analysverktyg. NICNOR AB tar inte emot insatser, förmedlar inte
                spel, hanterar inte spelkonton eller vinster och agerar inte som
                spelbolag. Tjänsten är inte ansluten till eller godkänd av ATG.
              </p>
              <p>
                Underlaget är ingen garanti för ett visst resultat. Användaren
                ansvarar alltid för sina egna beslut och för att granska data,
                analyser och genererade systemfiler innan de används. Tjänsten
                riktar sig till personer som har fyllt 18 år. Spela aldrig för
                mer än du har råd att förlora.
              </p>
              <p>
                Tillfälliga avbrott, fel eller förseningar kan förekomma,
                särskilt i beta-funktioner. NICNOR AB ansvarar inte för indirekt
                skada eller förlust som uppstår genom beslut baserade på
                tjänstens underlag, i den utsträckning en sådan begränsning är
                tillåten enligt tvingande lag.
              </p>
            </div>
          </article>

          <article className="rounded-2xl border border-gray-200 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon
                className="size-7 text-indigo-600"
                aria-hidden="true"
              />
              <h2 className="text-2xl font-semibold">Integritet</h2>
            </div>
            <div className="mt-5 space-y-4 text-sm/6 text-gray-600">
              <p>
                NICNOR AB är personuppgiftsansvarig. Vi kan behandla
                kontaktuppgifter, konto- och profiluppgifter, köp- och
                betalningsmetadata, kundserviceärenden samt tekniska uppgifter
                som krävs för att leverera och säkra tjänsten. Betalkortsnummer
                hanteras av betalningsleverantören och lagras inte i sin helhet
                av NICNOR AB.
              </p>
              <p>
                Uppgifter behandlas för att fullgöra avtal, ge support, uppfylla
                rättsliga skyldigheter och, efter samtycke när det krävs, skicka
                nyheter. Nödvändiga leverantörer kan behandla uppgifter för vår
                räkning. Uppgifter sparas bara så länge de behövs för ändamålet
                eller enligt lag.
              </p>
              <p>
                Tjänsten använder lokal lagring och sessionslagring i
                webbläsaren för funktioner som inloggning och chatt. Externa
                inloggnings- eller betaltjänster kan använda nödvändiga cookies
                enligt sina egna villkor.
              </p>
              <p>
                Du kan begära tillgång, rättelse, radering eller begränsning,
                invända mot viss behandling och begära dataportabilitet när det
                är tillämpligt. Kontakta oss via e-post. Du har även rätt att
                lämna klagomål till Integritetsskyddsmyndigheten.
              </p>
            </div>
          </article>
        </div>

        <div className="mt-10 rounded-2xl bg-indigo-50 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Frågor, uppsägning, ånger eller reklamation
            </h2>
            <p className="mt-2 text-sm/6 text-gray-600">
              Mejla NICNOR AB och beskriv vad ärendet gäller. Vi återkommer så
              snart vi kan.
            </p>
          </div>
          <a
            href="mailto:travanalys@gmail.com"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:mt-0"
          >
            <EnvelopeIcon className="size-5" aria-hidden="true" />
            travanalys@gmail.com
          </a>
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          Senast uppdaterad: 28 september 2026
        </p>
      </section>
    </main>
  );
};

export default About;
