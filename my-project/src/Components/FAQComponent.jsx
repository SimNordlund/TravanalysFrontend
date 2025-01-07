import { useRef, useState } from "react"

// Define the type for an individual FAQ item
interface FaqItem {
  q: string;
  a: string;
}

// Define the props type for the FaqsCard component
interface FaqsCardProps {
  faqsList: FaqItem;
  idx: number;
}

const FaqsCard: React.FC<FaqsCardProps> = ({ faqsList, idx }) => {
  // Type for useRef - since it's referencing a DOM element, we use HTMLDivElement
  const answerElRef = useRef<HTMLDivElement>(null);

  // Boolean state for toggle and string state for height
  const [state, setState] = useState<boolean>(false);
  const [answerH, setAnswerH] = useState<string>('0px');

  const handleOpenAnswer = () => {
    // Optional chaining is used here since `current` may be null initially
    const answerElH = answerElRef.current?.childNodes[0] as HTMLElement;
    const offsetHeight = answerElH?.offsetHeight ?? 0;
    setState(!state);
    setAnswerH(`${offsetHeight + 20}px`);
  };

  return (
    <div 
      className="space-y-3 mt-5 overflow-hidden border-b"
      key={idx}
      onClick={handleOpenAnswer}
    >
      <h4 className="cursor-pointer pb-5 flex items-center justify-between text-lg text-gray-700 font-medium">
        {faqsList.q}
        {
          state ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )
        }
      </h4>
      <div
        ref={answerElRef} className="duration-300"
        style={state ? { height: answerH } : { height: '0px' }}
      >
        <div>
          <p className="text-gray-500">
            {faqsList.a}
          </p>
        </div>
      </div>
    </div>
  );
};

const Faqs: React.FC = () => {
  const faqsList: FaqItem[] = [
    {
      q: "Vad är Karnor för någonting?",
      a: "Karnor är en platform som erbjuder verktyg för blablablablablalbva"
    },
    {
      q: "Vem är du och varför är du så kaxig?",
      a: "Jag är Karin Nordlund och mig bräcker ingen"
    },
    {
      q: "Hur använder jag årshjulet?",
      a: "Du får vänta på att det blir klart."
    },
    {
      q: "Gäller verktygen främst fritids?",
      a: "Verktygen gäller främst ankor"
    },
    {
      q: "Varför skulle jag lyssna på dig? Vad är dina meritder?",
      a: "Har du checkat in mitt CV? "
    }
  ];

  return (
    <section className="leading-relaxed max-w-screen-xl mt-12 mx-auto px-4 md:px-8">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl text-gray-800 font-semibold">
          Vanliga frågor
        </h1>
        <p className="text-gray-600 max-w-lg mx-auto text-lg">
          Hittar du inte ditt svar? Kontakta oss så hjälper vi dig.
        </p>
      </div>
      <div className="mt-14 max-w-2xl mx-auto">
        {
          faqsList.map((item, idx) => (
            <FaqsCard
              key={idx} // Add key prop to the mapped component
              idx={idx}
              faqsList={item}
            />
          ))
        }
      </div>
    </section>
  );
};

export default Faqs;
