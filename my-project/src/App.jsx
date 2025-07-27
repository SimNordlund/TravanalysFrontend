// App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RealNavbar from './RealNavbar';
import Home from './Home';
import SignUp from './SignUp';
import SignIn from './SignIn';
import ReducedButtons from './Components/ReducedButtons';
import FAQComponent from './Components/FAQComponent';
import Newsletter from './Newsletter';
import ToggleComponent from './Components/ToggleComponent';

export default function App() {
  return (
    <>
      <RealNavbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/Components/SkrytComponent" element={<FAQComponent/>} />
        <Route path="/Components/ReducedButtons" element={<ReducedButtons/>} />
        <Route path="/Components/GitHubLoginButton" element={<Home/>} />
        <Route path="/ChartPage/:view" element={<ToggleComponent syncWithRoute={true} />} /> 
        <Route path="/ChartPage" element={<Navigate to="/ChartPage/analys" replace />} />
      </Routes>
      <Newsletter />
    </>
  );
}
