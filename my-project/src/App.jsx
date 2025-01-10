import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RealNavbar from './RealNavbar';
import Home from './Home';
import SignUp from './SignUp';
import SignIn from './SignIn';
import AboutUs from './AboutUs';
import ReducedButtons from './Components/ReducedButtons';
import SkrytComponent from './Components/SkrytComponent';
import GitHubLoginButton from './Components/GitHubLoginButton';
import Avdelning5Table from './Components/Avdelning5Table';

export default function App() {
  return (
    <>
    <RealNavbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/Components/SkrytComponent" element={<SkrytComponent/>}  />
        <Route path="/Components/ReducedButtons" element={<ReducedButtons/>}  />
        <Route path="/Components/GitHubLoginButton" element={<Home/>} />
        <Route path="/Components/Avdelning5Table" element={<Avdelning5Table/>} />
      </Routes>
    </>
  );
}

