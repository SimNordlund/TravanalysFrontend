import Pricing from './Pricing';
import PreviewFrontPage from './PreviewHomePage';
import ToggleComponent from './Components/ToggleComponent'
import IntroComponent from './Components/IntroComponent';
import ChatBox from './Components/TravChat';
import Marketing from './Marketing';

export default function Home() {

  return (
    <div>
      {/*<Present />*/}
      {/*<PreviewFrontPage/>*/}
      <IntroComponent></IntroComponent>
      <ToggleComponent></ToggleComponent>
      {/*<Marketing></Marketing>*/}
      <Pricing></Pricing>
       {/*<ChatBox></ChatBox>*/}
    </div>
  );
}
