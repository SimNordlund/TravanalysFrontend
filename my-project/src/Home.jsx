import React, { useState } from 'react';
import Marketing from './Marketing';
import Pricing from './Pricing';
import Newsletter from './Newsletter';
import Preview from './Preview';
import Present from './Present';
import Modal from './Modal';
import HorseComponent from './Components/HorseComponent';
import Settings from './Settings';
import AboutUs from './AboutUs';
import Swish from './Components/Swish';
import ToggleComponent from './Components/ToggleComponent';
import Slideshow from './Components/Slideshow';
import ReducedSystemButton from './Components/ReducedSystemButton';

export default function Home() {
  const [isModalOpen, setModalOpen] = useState(false);

  // const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  // const username = localStorage.getItem('username');

  return (
    <div>
      <Present />
      <ToggleComponent />
      <Pricing></Pricing>
      <Preview />
      <Newsletter />
    </div>
  );
}
