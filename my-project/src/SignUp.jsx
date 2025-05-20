import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 

export default function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [passWord, setPassWord] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
  setIsPasswordVisible(!isPasswordVisible);
};

  const navigate = useNavigate(); 
  const handleSubmit = async (event) => {
    event.preventDefault();

    const userData = { firstName, lastName, passWord, phoneNumber ,email, country, address, city, postalCode };

    fetch('http://localhost:8080/storeQuestion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    .then(response => response.text())
    .then(data => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });

    navigate('/signin');
  };


  return (
    <form className='flex justify-center mt-10' onSubmit={handleSubmit}>
      <div className="space-y-5">
      
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-bold leading-12 text-gray-900">Registrering</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">Tar max 1-2 min. Sen kör vi!</p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-5">
            <div className="sm:col-span-2">
              <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                Förnamn
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="first-name"
                  id="first-name"
                  autoComplete="given-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
               />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
                Efternamn
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="last-name"
                  id="last-name"
                  autoComplete="family-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="block sm:col-span-3">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Välj ett lösenord
              </label>
              <div className="mt-2">
                <input 
                  type={isPasswordVisible ? "text" : "password"}
                  name="password"
                  id="password"
                  autoComplete="password"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={passWord}
                  onChange={(e) => setPassWord(e.target.value)}
               />
               <button 
               type="button" //Knapp
               className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                onClick={togglePasswordVisibility}>
                Visa lösenord
                </button> 
              </div>
            </div>

            <div className=" block sm:col-span-3">
              <label htmlFor="phone-number" className="block text-sm font-medium leading-6 text-gray-900">
                Telefonnummer
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="phone-number"
                  id="phone-number"
                  autoComplete="phone-number"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
               />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}               
               />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="country" className="block text-sm font-medium leading-6 text-gray-900">
                Land
              </label>
              <div className="mt-2">
                <select
                  id="country"
                  name="country"
                  autoComplete="country-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <option>Välj ett land</option>
                  <option>Sverige</option>
                  <option>Norge</option>
                  <option>Knuthöjden</option>
                </select>
              </div>
            </div>

            <div className="col-span-full">
              <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-gray-900">
                Adress
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="street-address"
                  id="street-address"
                  autoComplete="street-address"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="sm:col-span-2 sm:col-start-1">
              <label htmlFor="city" className="block text-sm font-medium leading-6 text-gray-900">
                Stad
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="city"
                  id="city"
                  autoComplete="address-level2"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            
            <div className="sm:col-span-2">
              <label htmlFor="postal-code" className="block text-sm font-medium leading-6 text-gray-900">
                Postnummer
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="postal-code"
                  id="postal-code"
                  autoComplete="postal-code"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={postalCode}
                 onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Notifikationer</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Trött på att missa nyheter? Vill du hålla dig uppdaterad? Tryck på alternativen nedan så löser vi det.
          </p>

          <div className="mt-10 space-y-10">
            <fieldset>
              <legend className="text-sm font-semibold leading-6 text-gray-900">Email</legend>
              <div className="mt-6 space-y-6">
                <div className="relative flex gap-x-3">
                  <div className="flex h-6 items-center">
                    <input
                      id="comments"
                      name="comments"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                  </div>
                  <div className="text-sm leading-6">
                    <label htmlFor="comments" className="font-medium text-gray-900">
                      Nya starter
                    </label>
                    <p className="text-gray-500">Bli påmind om när lopp startar</p>
                  </div>
                </div>
                <div className="relative flex gap-x-3">
                  <div className="flex h-6 items-center">
                    <input
                      id="candidates"
                      name="candidates"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                  </div>
                  <div className="text-sm leading-6">
                    <label htmlFor="candidates" className="font-medium text-gray-900">
                      Erbjudanden
                    </label>
                    <p className="text-gray-500">Få information om erbjudanden</p>
                  </div>
                </div>
                <div className="relative flex gap-x-3">
                  <div className="flex h-6 items-center">
                    <input
                      id="offers"
                      name="offers"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                  </div>
                  <div className="text-sm leading-6">
                    <label htmlFor="offers" className="font-medium text-gray-900">
                      Ölstuga
                    </label>
                    <p className="text-gray-500">Få information om när Online-Ölstugan öppnar</p>
                  </div>
                </div>
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-sm font-semibold leading-6 text-gray-900">Sms/Telefon</legend>
              <p className="mt-1 text-sm leading-6 text-gray-600"> Föredrar du sms? </p>
              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-x-3">
                  <input
                    id="push-everything"
                    name="push-notifications"
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label htmlFor="push-everything" className="block text-sm font-medium leading-6 text-gray-900">
                    Nya starter
                  </label>
                </div>
                <div className="flex items-center gap-x-3">
                  <input
                    id="push-email"
                    name="push-notifications"
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label htmlFor="push-email" className="block text-sm font-medium leading-6 text-gray-900">
                    Erbjudanden
                  </label>
                </div>
                <div className="flex items-center gap-x-3">
                  <input
                    id="push-nothing"
                    name="push-notifications"
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label htmlFor="push-nothing" className="block text-sm font-medium leading-6 text-gray-900">
                  Ölstuga
                  </label>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-x-6">
      <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Registrera
        </button>
        <button type="button" className="text-sm font-semibold leading-6 text-gray-900">
          Avbryt
        </button>
      </div>
            </fieldset>
          </div>
        </div>
      </div>

    </form>
  )
}
