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

export default function Home() {
  const [isModalOpen, setModalOpen] = useState(false);
  const toggleModal = () => setModalOpen(!isModalOpen);

  // const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  // const username = localStorage.getItem('username');

  return (
    <div>
      <Present />
      <ToggleComponent />
      <Newsletter />
      {/*
      <AboutUs />
      <Preview />
      <Marketing />
      <Pricing onAccessClick={toggleModal} />
      <Newsletter />
      <Modal isOpen={isModalOpen} close={toggleModal}>
        <img src="src/Bilder/SwishFörLandet.png" alt="Modal Content" style={{ width: "100%", height: "auto" }} />
      </Modal>
      <Swish />
      */}
    </div>
  );
}
