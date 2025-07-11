import Pricing from './Pricing';
import Present from './Present';
import PreviewFrontPage from './PreviewHomePage';
import ToggleComponent from './Components/ToggleComponent'
import IntroComponent from './Components/IntroComponent';
import ChatBox from './Components/TravChat';

export default function Home() {

  return (
    <div className="bg-slate-100">
      {/*<Present />*/}
      {/*<PreviewFrontPage/>*/}
      <IntroComponent></IntroComponent>
      <ToggleComponent></ToggleComponent>
      <Pricing></Pricing>
      <ChatBox></ChatBox>
       {/*<ChatBox></ChatBox>*/}
    </div>
  );
}
