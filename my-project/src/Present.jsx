import React from 'react';
import UserProfile from './Components/UserProfile';

export default function Present(){

  return (
          <div className="text-center m-10">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              travanalys.se
            </h1>
            <h2 className="text-1xl sm:text-2xl md:text-1x4 italic tracking-tight text-gray-900 mt-2">
            The game changer  
            </h2> 
            <div className="mt-5">
            <UserProfile></UserProfile>
            </div>
            <hr className="mt-4"></hr>
          </div>
          

  );
};

