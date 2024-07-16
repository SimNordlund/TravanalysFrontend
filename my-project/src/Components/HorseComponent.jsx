import React, { useState, useEffect } from 'react';

function HorseComponent() {
    const [horse, setHorse] = useState(null);
    const [loading, setLoading] = useState(true);  // Tracks loading state
    const [error, setError] = useState(null);  // Tracks error state

    useEffect(() => {
        fetch('http://localhost:8080/api/horses/1')
            .then(response => {
                if (!response.ok) {  // Check if response is successful
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                setHorse(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
                setError(error.toString());
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!horse) return <div>No horse data available.</div>;

    return (
        <div>
            <h1>Horse Details</h1>
            <p>ID: {horse.id}</p>
            <p>Name: {horse.name}</p>
        </div>
    );
}

export default HorseComponent;
