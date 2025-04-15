import Pricing from './Pricing';
import Present from './Present';
import PreviewFrontPage from './PreviewHomePage';
import MessengerChat from './Components/MessengerChat';

export default function Home() {

  return (
    <div>
      {/*<Present />*/}
      <PreviewFrontPage/>
      <Pricing></Pricing>
      <MessengerChat></MessengerChat>
    </div>
  );
}
