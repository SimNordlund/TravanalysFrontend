import Pricing from './Pricing';
import Present from './Present';
import PreviewFrontPage from './PreviewHomePage';
import ToggleComponent from './Components/ToggleComponent'
import MessengerChat from './Components/MessengerChat';

export default function Home() {

  return (
    <div className="bg-slate-100">
      {/*<Present />*/}
      {/*<PreviewFrontPage/>*/}
      <ToggleComponent></ToggleComponent>
      <Pricing></Pricing>
      <MessengerChat></MessengerChat>
    </div>
  );
}
