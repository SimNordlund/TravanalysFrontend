import React, { useState, useEffect } from 'react';

function HorseComponent() {
    const [horses, setHorses] = useState([]);  // Change to array for multiple horses
    const [loading, setLoading] = useState(true);  // Tracks loading state
    const [error, setError] = useState(null);  // Tracks error state

    useEffect(() => {
        fetch('http://localhost:8080/api/horses')  // Fetch all horses
            .then(response => {
                if (!response.ok) {  // Check if response is successful
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                setHorses(data);  // Store the horses array
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
    if (horses.length === 0) return <div>No horse data available.</div>;  // Handle empty array case

    return (
        <div>
            <h1>All Horses</h1>
            <ul>
                {horses.map(horse => (
                    <li key={horse.id}>
                        <p>ID: {horse.id}</p>
                        <p>Name: {horse.name}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default HorseComponent;
