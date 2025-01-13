import React, { useState } from 'react';
import Pricing from './Pricing';
import Newsletter from './Newsletter';
import Preview from './Preview';
import Present from './Present';
import ToggleComponent from './Components/ToggleComponent';
import PaginatedLapTable from './Components/PaginatedLapTable';

export default function Home() {
  const [isModalOpen, setModalOpen] = useState(false);

  // const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  // const username = localStorage.getItem('username');

  return (
    <div>
      <Present />
      <ToggleComponent />
      <PaginatedLapTable/>
      <Preview />
      <Pricing></Pricing>
      <Newsletter />
    </div>
  );
}
