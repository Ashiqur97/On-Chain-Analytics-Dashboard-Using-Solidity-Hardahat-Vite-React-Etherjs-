import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

interface AnalyticsChartProps {
  addresses: { address: string; value: bigint }[];
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ addresses }) => {
  const data = {
    labels: addresses.map(a => a.address.slice(0, 6) + '...' + a.address.slice(-4)),
    datasets: [
      {
        label: 'ETH Value',
        data: addresses.map(a => Number(a.value) / 1e18),
        fill: true,
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        tension: 0.4,
        pointBackgroundColor: 'rgba(236, 72, 153, 1)',
        pointBorderColor: '#fff',
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: { color: '#fff' },
      },
      title: {
        display: true,
        text: 'Top Addresses by Value (ETH)',
        color: '#fff',
        font: {
          size: 18,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.parsed.y.toFixed(4)} ETH`,
        },
        backgroundColor: 'rgba(55,65,81,0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
    scales: {
      x: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.08)' },
      },
      y: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.08)' },
      },
    },
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8">
      <Line data={data} options={options} height={250} />
    </div>
  );
};
