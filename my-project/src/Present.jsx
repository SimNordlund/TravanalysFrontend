import React from 'react';
import { Link } from 'react-router-dom';


export default function Present(){

  return (
          <div className="text-center m-10">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Travanalys
            </h1>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              - The game changer
            </h2>
            <hr className="mt-4"></hr>
            <p className="mt-2 text-lg leading-8 text-gray-600">
              Bäst odds och statistik i travsektorn. 
              <br></br>
              Sortera på datum, bana, spelform och lopp.
            </p>
            {/*
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/signin"
                className="rounded-md bg-blue-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Logga in
              </Link>
              <Link
                to="/signup"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Skapa konto
              </Link>
              <a href="#" className=" rounded-md px-3.5 py-1.5 text-sm font-semibold leading-6 text-gray-900 shadow-sm border border-black  hover:bg-gray-100">
                Testa gratis <span aria-hidden="true">→</span>
            </a>
            </div> 
            */}
          </div>
          

  );
};

