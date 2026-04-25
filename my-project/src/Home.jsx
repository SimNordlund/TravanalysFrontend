import Pricing from './Pricing';
import PreviewFrontPage from './PreviewHomePage';
import ToggleComponent from './Components/ToggleComponent'
import IntroComponent from './Components/IntroComponent';
import ChatBox from './Components/TravChat';
import Marketing from './Marketing';
import IntroWithCarousel from './Components/IntroWithCarousel';
import Reveal from './Components/Reveal';

export default function Home() {

  return (
    <div>
      {/*<PreviewFrontPage/>*/}
      <Reveal>
        <IntroComponent></IntroComponent>
      </Reveal>
      <Reveal delay="short">
        <IntroWithCarousel></IntroWithCarousel>
      </Reveal>
      <Reveal delay="medium">
        <ToggleComponent></ToggleComponent>
      </Reveal>
      {/*<Marketing></Marketing>*/}
      <Reveal delay="short">
        <Pricing></Pricing>
      </Reveal>
       {/*<ChatBox></ChatBox>*/}
    </div>
  );
}
