import React, { useState } from 'react';
import BarChart from './BarChart';
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
import ToggleComponent from './Components/ToggleComponent'; // Import ToggleComponent
import Slideshow from './Components/Slideshow';


export default function Home() {
  const [isModalOpen, setModalOpen] = useState(false);
  const toggleModal = () => setModalOpen(!isModalOpen);

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const username = localStorage.getItem('username');

  const datasets = [
    {
      label: 'Stapel Exempel',
      data: [12, 19, 8, 5, 22, 15, 22, 16, 23, 12],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderWidth: 2,
    },
  ];

  const labels = ['Röd', 'Blå', 'Gul', 'Grön', 'Lila', 'Orange'];

  return (
    <div>
    {/*  {isLoggedIn && (
        <h2 className='text-center m-7 text-4xl font-bold tracking-tight text-gray-600 sm:text-4xl'>Var hälsad {username}!</h2>
      )} */}
      <Present />
      <ToggleComponent /> 
      <Newsletter />
     {/* 
     <AboutUs></AboutUs>
     <Preview />
      <Marketing />
      <Pricing onAccessClick={toggleModal} />
      <Newsletter />
      <Modal isOpen={isModalOpen} close={toggleModal}>
        <img src="src/Bilder/SwishFörLandet.png" alt="Modal Content" style={{ width: "100%", height: "auto" }} />
      </Modal>
      <Swish /> */}
    </div>
  );
}
