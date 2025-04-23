import Pricing from './Pricing';
import Present from './Present';
import PreviewFrontPage from './PreviewHomePage';
import ToggleComponent from './Components/ToggleComponent'
import MessengerChat from './Components/MessengerChat';
import IntroComponent from './Components/IntroComponent';

export default function Home() {

  return (
    <div className="bg-slate-100">
      {/*<Present />*/}
      {/*<PreviewFrontPage/>*/}
      <IntroComponent></IntroComponent>
      <ToggleComponent></ToggleComponent>
      <Pricing></Pricing>
      <MessengerChat></MessengerChat>
    </div>
  );
}
