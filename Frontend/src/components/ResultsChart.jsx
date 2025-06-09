import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

export default function ResultsChart({ options, results }) {
  if (!results) return <div>Waiting for votes...</div>;

  const data = {
    labels: options,
    datasets: [
      {
        label: 'Votes',
        data: options.map(opt => results[opt] || 0),
        backgroundColor: [
          'rgba(75,192,192,0.6)',
          'rgba(255,99,132,0.6)',
          'rgba(255,206,86,0.6)',
          'rgba(54,162,235,0.6)',
          'rgba(153,102,255,0.6)',
          'rgba(255,159,64,0.6)'
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h4>Live Results</h4>
      <Bar data={data} options={{ indexAxis: 'y', responsive: true }} />
      <Pie data={data} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
    </div>
  );
} 