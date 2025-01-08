import React from 'react';

const API_GITHUB_URL = import.meta.env.VITE_API_GITHUB_URL;

const GitHubLoginButton = () => {
    const handleLogin = () => {
        // Redirect the user to the Spring Boot backend's GitHub OAuth2 endpoint
        window.location.href = API_GITHUB_URL;
    };

    return (
        <div classname="text-center sm:pb-32 mt-8">
            <button className="bg-gray-700 hover:bg-gray-500 text-white font-semibold rounded shadow py-2 px-10 focus:outline-none focus:shadow-outline transition duration-300 ease-in-out mt-4"
                onClick={handleLogin}
            >
                Logga in med Github
            </button>
        </div>
    );
};

export default GitHubLoginButton;
