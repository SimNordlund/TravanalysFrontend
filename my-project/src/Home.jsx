import Pricing from './Pricing';
import Present from './Present';
import PreviewFrontPage from './PreviewHomePage';

export default function Home() {

  return (
    <div>
      <Present />
      <PreviewFrontPage/>
      <Pricing></Pricing>
    </div>
  );
}
