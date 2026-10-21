import { BadgeCheck, Building2, Mail, ShieldCheck } from "lucide-react";

const companyDetails = [
  ["Juridiskt företagsnamn", "NICNOR AB"],
  ["Varumärke och tjänst", "Travanalys.se"],
  ["Organisationsnummer", "556990-1837"],
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
    <main className="min-w-0 bg-slate-50 px-3 text-left text-slate-700 sm:px-6">
      <section className="pb-2 pt-8 sm:pt-12">
        <div className="mx-auto w-full max-w-6xl px-1">
          <div className="max-w-3xl">
            <p className="mb-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
              <span className="h-1 w-6 rounded-full bg-indigo-500" aria-hidden="true" />
              Om Travanalys
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Tydligare beslutsunderlag för svensk travsport<span className="text-indigo-500">.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
              Travanalys.se utvecklas och drivs av NICNOR AB. Tjänsten samlar,
              analyserar och visualiserar travdata för att göra det enklare att
              jämföra hästar och skapa ett eget, välgrundat beslutsunderlag.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl py-8 sm:py-12">
        <div className="grid min-w-0 gap-5 sm:gap-6 lg:grid-cols-2">
          <article className="analytics-section">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600" aria-hidden="true">
                <Building2 className="h-5 w-5" />
              </span>
              <h2 className="min-w-0 pt-1.5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">Företagsuppgifter</h2>
            </div>
            <dl className="mt-5 divide-y divide-slate-100 text-sm">
              {companyDetails.map(([label, value]) => (
                <div
                  key={label}
                  className="grid min-w-0 gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-4"
                >
                  <dt className="font-semibold text-slate-700">{label}</dt>
                  <dd className="text-slate-500">{value}</dd>
                </div>
              ))}
              <div className="grid min-w-0 gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-4">
                <dt className="font-semibold text-slate-700">Kundservice</dt>
                <dd>
                  <a
                    href="mailto:travanalys@gmail.com"
                    className="break-words rounded-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 motion-reduce:transition-none"
                  >
                    travanalys@gmail.com
                  </a>
                </dd>
              </div>
            </dl>
          </article>

          <article className="analytics-section">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 text-teal-700" aria-hidden="true">
                <BadgeCheck className="h-5 w-5" />
              </span>
              <h2 className="min-w-0 pt-1.5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">Det här erbjuder vi</h2>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-500">
              Travanalys är en digital informations- och analystjänst. Tjänsten
              kan innehålla både kostnadsfria funktioner och funktioner som
              kräver betalning.
            </p>
            <ul className="mt-5 space-y-3">
              {serviceFeatures.map((feature) => (
                <li key={feature} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-sm leading-6 text-slate-600">
                  <BadgeCheck
                    className="mt-0.5 h-5 w-5 shrink-0 text-teal-600"
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="min-w-0">
        <div className="mx-auto w-full max-w-6xl py-8 sm:py-12">
          <div className="max-w-3xl">
            <p className="mb-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
              <span className="h-1 w-6 rounded-full bg-indigo-500" aria-hidden="true" />
              Kundvillkor
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Köp, leverans och återbetalning<span className="text-indigo-500">.</span>
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-500">
              Villkoren nedan gäller när NICNOR AB erbjuder en betald digital
              tjänst på Travanalys.se. Pris, eventuell abonnemangsperiod och vad
              som ingår visas alltid innan ett köp slutförs.
            </p>
          </div>

          <div className="mt-6 grid min-w-0 gap-5 sm:gap-6 md:grid-cols-2">
            <article className="analytics-section">
              <h3 className="text-base font-bold tracking-tight text-slate-800 sm:text-lg">Beställning och betalning</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Kunden får möjlighet att kontrollera tjänst, totalpris,
                betalningsintervall och eventuella skatter innan beställningen
                bekräftas. Betalning sker med den betalmetod som anges i kassan.
                En order- eller betalningsbekräftelse skickas elektroniskt.
              </p>
            </article>

            <article className="analytics-section">
              <h3 className="text-base font-bold tracking-tight text-slate-800 sm:text-lg">Digital leverans</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Åtkomst till en köpt digital tjänst ges normalt direkt efter
                bekräftad betalning. Eventuella särskilda tekniska krav eller
                avvikelser i leveranstid visas före köpet. Kontakta kundservice
                om åtkomsten inte aktiveras som utlovat.
              </p>
            </article>

            <article className="analytics-section">
              <h3 className="text-base font-bold tracking-tight text-slate-800 sm:text-lg">Abonnemang och uppsägning</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Ett löpande abonnemang förnyas med den period som visas vid
                köpet tills det sägs upp. Uppsägning kan göras genom att mejla
                kundservice och gäller senast från slutet av den redan betalda
                perioden. Ingen ny debitering görs därefter. Eventuell
                bindnings- eller uppsägningstid anges tydligt före köp.
              </p>
            </article>

            <article className="analytics-section">
              <h3 className="text-base font-bold tracking-tight text-slate-800 sm:text-lg">Ångerrätt</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                En konsument har som huvudregel 14 dagars ångerrätt från den dag
                avtalet ingås på distans. Meddela kundservice skriftligen och
                ange vilken tjänst köpet gäller. Om kunden uttryckligen begär
                att tjänsten ska börja under ångerfristen kan NICNOR AB ha rätt
                till skälig ersättning för den del som redan har levererats.
                För digitalt innehåll kan ångerrätten upphöra först efter
                kundens uttryckliga samtycke och bekräftelse enligt lag.
              </p>
            </article>

            <article className="analytics-section">
              <h3 className="text-base font-bold tracking-tight text-slate-800 sm:text-lg">
                Återbetalning och reklamation
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Vid godkänd ånger, felaktig debitering eller en tjänst som inte
                levererats enligt avtalet görs återbetalning till samma
                betalningsmetod utan onödigt dröjsmål och, när lagens tidsfrist
                gäller, senast inom 14 dagar. Reklamera så snart som möjligt via
                kundservice och beskriv felet. Detta begränsar inte tvingande
                konsumenträttigheter.
              </p>
            </article>

            <article className="analytics-section">
              <h3 className="text-base font-bold tracking-tight text-slate-800 sm:text-lg">Tvister och kampanjer</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
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

      <section className="mx-auto w-full max-w-6xl py-8 sm:py-12">
        <div className="grid min-w-0 gap-5 sm:gap-6 lg:grid-cols-2">
          <article className="analytics-section">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-700" aria-hidden="true">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h2 className="min-w-0 pt-1.5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                Ansvarsfull användning och begränsningar
              </h2>
            </div>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-500">
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

          <article className="analytics-section">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700" aria-hidden="true">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h2 className="min-w-0 pt-1.5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">Integritet</h2>
            </div>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-500">
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

        <div className="mt-6 flex min-w-0 flex-col items-start gap-5 rounded-3xl border border-indigo-100 bg-indigo-50/70 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-800 sm:text-lg">
              Frågor, uppsägning, ånger eller reklamation
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Mejla NICNOR AB och beskriv vad ärendet gäller. Vi återkommer så
              snart vi kan.
            </p>
          </div>
          <a
            href="mailto:travanalys@gmail.com"
            className="inline-flex min-h-11 max-w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-indigo-600 bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3 text-xs font-semibold text-white shadow-sm transition-colors hover:from-indigo-700 hover:to-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 motion-reduce:transition-none sm:text-sm"
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
            travanalys@gmail.com
          </a>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Senast uppdaterad: 28 september 2026
        </p>
      </section>
    </main>
  );
};

export default About;
