import Pricing from './Pricing';
import Newsletter from './Newsletter';
import Preview from './Preview';
import Present from './Present';
import ToggleComponent from './Components/ToggleComponent';
import PreviewFrontPage from './PreviewHomePage';
import ChartPage from './ChartPage';

export default function Home() {

  return (
    <div>
      <Present />
      <PreviewFrontPage/>
      <Pricing></Pricing>
    </div>
  );
}
