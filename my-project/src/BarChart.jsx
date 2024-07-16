import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const BarChartComponent = () => {
  const [data, setData] = useState({
    labels: [],
    datasets: [{
      label: 'Value One',
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1,
    }]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/radar/find/all')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
      })
      .then(fetchedData => {
        const labels = fetchedData.map(horse => horse.name);
        const values = fetchedData.map(horse => horse.valueOne);
        const backgroundColors = fetchedData.map(() => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`);
        const borderColors = backgroundColors.map(color => color.replace('0.5', '1'));

        setData({
          labels: labels,
          datasets: [{
            label: 'Rankning efter störst Odds',
            data: values,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1
          }]
        });
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError(error.toString());
        setLoading(false);
      });
  }, []);

  const options = {
    scales: {
      y: {
        beginAtZero: true
      },
      x: {
        categoryPercentage: 0.8,
        barPercentage: 0.9,
      }
    },
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: true,
      }
    },
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data.datasets.length) return <div>No data available.</div>;

  return (
    <div style={{ width: '1000px', height: '500px' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

export default BarChartComponent;
