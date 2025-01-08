import { useNavigate } from "react-router-dom";
import React, { useState } from 'react';
import GitHubLoginButton from "./Components/GitHubLoginButton";
import travhorsi from './Bilder/travhorsi2.png';
import GoogleLoginButton from "./Components/GoogleLoginButton";

export default function SignIn() {
  const navigateSignIn = useNavigate();

  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showError, setShowError] = useState(false);

  const handleSignIn = async (event) => {
    event.preventDefault();

    const credentials = {
      username: userEmail,
      password: userPassword
    };

    try {
      const response = await fetch('http://localhost:8080/user/authenticate', { // Adjust the URL as needed based on your API setup
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        const user = await response.json(); // Assuming the API returns the user data on successful authentication
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', user.username); // Ensure that your API actually returns `username`
        navigateSignIn('/'); // Redirect user to the homepage or dashboard
      } else {
        throw new Error('Authentication failed!');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setShowError(true); // Show error message
      setTimeout(() => setShowError(false), 15000); // Hide after 15 seconds
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="mx-auto h-114 w-auto"
          src={travhorsi}
          alt="Your Company"
        />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Logga in på ditt konto
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSignIn}>
          {showError && (
            <div id="wrongPW" className="block font-medium leading-6 text-red-600 text-lg text-center border-red-400 border-4 py-2 rounded-lg">
              Användarnamnet eller lösenordet är felaktigt alternativt finns inte.
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
              Email
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                onChange={(e) => setUserEmail(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Lösenord
              </label>
              <div className="text-sm">
                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Glömt lösenordet?
                </a>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                onChange={(e) => setUserPassword(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Logga in
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Har du inget konto?{' '}
          <a href="/signup" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Skapa ett konto här
          </a>
          <GitHubLoginButton/>
          <GoogleLoginButton/>
        </p>
      </div>
    </div>
  );
}
