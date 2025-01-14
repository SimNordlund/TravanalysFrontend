import React from 'react';

const API_GOOGLE_URL = import.meta.env.VITE_API_GOOGLE_URL;

const GoogleLoginButton = () => {
    const handleLogin = () => {
        window.location.href = API_GOOGLE_URL;
    };

    return (
        <div classname="text-center sm:pb-32 mt-8">
            <button className="bg-green-700 hover:bg-green-600 text-white font-semibold rounded shadow py-2 px-10 focus:outline-none focus:shadow-outline transition duration-300 ease-in-out mt-4"
                onClick={handleLogin}
            >
                Logga in med Google
            </button>
        </div>
    );
};

export default GoogleLoginButton;
