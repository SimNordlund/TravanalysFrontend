import React, { useEffect, useState } from 'react';

const UserProfile = () => {
    const [userEmail, setUserEmail] = useState(null);
    const [error, setError] = useState(null);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        // Fetch the logged-in user's email
        fetch(`${API_BASE_URL}/g-login/email`, {
            credentials: 'include', // Include cookies for session authentication
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('');
                }
                return response.text();
            })
            .then((email) => {
                setUserEmail(email);
            })
            .catch((err) => {
                setError(err.message);
            });
    }, []);

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div className="text-center">
            {userEmail ? (
                <h1>Välkommen {userEmail}!</h1>
            ) : (
                <p>Laddar profil...</p>
            )}
        </div>
    );
};

export default UserProfile;
