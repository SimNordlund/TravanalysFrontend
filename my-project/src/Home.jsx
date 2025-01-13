import Pricing from './Pricing';
import Newsletter from './Newsletter';
import Preview from './Preview';
import Present from './Present';
import ToggleComponent from './Components/ToggleComponent';

export default function Home() {

  return (
    <div>
      <Present />
      <ToggleComponent />
      <Pricing></Pricing>
    </div>
  );
}
