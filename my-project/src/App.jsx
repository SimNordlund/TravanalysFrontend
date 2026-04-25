import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RealNavbar from './RealNavbar';
import Home from './Home';
import SignUp from './SignUp';
import SignIn from './SignIn';
import ReducedButtons from './Components/ReducedButtons';
import FAQComponent from './Components/FAQComponent';
import Newsletter from './Newsletter';
import ChatBox from './Components/TravChat';
import ToggleComponent from './Components/ToggleComponent';
import Reveal from './Components/Reveal';

export default function App() {
  return (
    <>
      <RealNavbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/signup"
          element={
            <Reveal>
              <SignUp />
            </Reveal>
          }
        />
        <Route
          path="/signin"
          element={
            <Reveal>
              <SignIn />
            </Reveal>
          }
        />
        <Route
          path="/faq"
          element={
            <Reveal>
              <FAQComponent />
            </Reveal>
          }
        />
        <Route
          path="/Components/ReducedButtons"
          element={
            <Reveal>
              <ReducedButtons />
            </Reveal>
          }
        />
        <Route path="/Components/GitHubLoginButton" element={<Home/>} />
        <Route
          path="/chart/:view"
          element={
            <Reveal>
              <ToggleComponent syncWithRoute={true} />
            </Reveal>
          }
        />
        <Route path="/chart" element={<Navigate to="/ChartPage/analys" replace />} />
      </Routes>
      <ChatBox />
      <Newsletter />
    </>
  );
}
