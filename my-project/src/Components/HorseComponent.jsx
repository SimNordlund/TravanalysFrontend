import React, { useState, useEffect } from 'react';

function HorseComponent() {
    const [horses, setHorses] = useState([]); 
    const [loading, setLoading] = useState(true);  
    const [error, setError] = useState(null); 
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/horses`)
            .then(response => {
                if (!response.ok) {  
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                setHorses(data);  
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
    if (horses.length === 0) return <div>No horse data available.</div>;  

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
