import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RealNavbar from './RealNavbar';
import Home from './Home';
import SignUp from './SignUp';
import SignIn from './SignIn';
import ReducedButtons from './Components/ReducedButtons';
import FAQComponent from './Components/FAQComponent';
import Tables from './Tables';
import Newsletter from './Newsletter';
import ChartPage from './ChartPage';

export default function App() {
  return (
    <>
    <RealNavbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/Components/SkrytComponent" element={<FAQComponent/>}  />
        <Route path="/Components/ReducedButtons" element={<ReducedButtons/>}  />
        <Route path="/Components/GitHubLoginButton" element={<Home/>} />
        <Route path="/Tables" element={<Tables/>} />
        <Route path="/ChartPage" element={<ChartPage/>}/>
      </Routes>
      <Newsletter/>
    </>
  );
}

