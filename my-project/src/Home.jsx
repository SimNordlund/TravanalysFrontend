import Pricing from './Pricing';
import PreviewFrontPage from './PreviewHomePage';
import ToggleComponent from './Components/ToggleComponent'
import IntroComponent from './Components/IntroComponent';
import ChatBox from './Components/TravChat';
import Marketing from './Marketing';
import IntroWithCarousel from './Components/IntroWithCarousel';

export default function Home() {

  return (
    <div>
      {/*<PreviewFrontPage/>*/}
      <IntroComponent></IntroComponent>
      <IntroWithCarousel></IntroWithCarousel>
      <ToggleComponent></ToggleComponent>
      {/*<Marketing></Marketing>*/}
      <Pricing></Pricing>
       {/*<ChatBox></ChatBox>*/}
    </div>
  );
}
