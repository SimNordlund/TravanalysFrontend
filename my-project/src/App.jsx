import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RealNavbar from './RealNavbar';
import Home from './Home';
import SignUp from './SignUp';
import SignIn from './SignIn';
import AboutUs from './AboutUs';

export default function App() {
  return (
    <>
    <RealNavbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/AboutUs" element={<AboutUs/>}  />
      </Routes>
    </>
  );
}

