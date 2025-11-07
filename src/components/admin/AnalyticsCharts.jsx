import React from 'react';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components (safe to call multiple times)
try {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
  );
} catch (e) {
  // In tests, chart.js may be mocked; ignore registration errors
}

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    tooltip: { enabled: true },
    title: { display: false }
  },
  scales: {
    x: { ticks: { autoSkip: true, maxRotation: 0 } },
    y: { beginAtZero: true }
  }
};

const mergeOptions = (options) => ({ ...baseOptions, ...(options || {}) });

const safeArray = (arr) => (Array.isArray(arr) ? arr : []);

const makeData = (label) => ({
  labels: [],
  datasets: [{ label, data: [] }]
});

export const EnrollmentTrendsChart = ({ data, options = {} }) => {
  const rows = safeArray(data);
  const labels = rows.map((r) => r?.month ?? '').filter((l) => l !== '');
  const enrollments = rows.map((r) => Number(r?.enrollments ?? 0));
  const capacity = rows.map((r) => Number(r?.capacity ?? 0));

  const chartData = labels.length
    ? {
        labels,
        datasets: [
          { label: 'Enrollments', data: enrollments, borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.2)' },
          { label: 'Capacity', data: capacity, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.2)' }
        ]
      }
    : makeData('Enrollments');

  return <Line data={chartData} options={mergeOptions(options)} />;
};

export const DepartmentEnrollmentChart = ({ data, options = {} }) => {
  const rows = safeArray(data);
  const labels = rows.map((r) => r?.department ?? '').filter((l) => l !== '');
  const enrolled = rows.map((r) => Number(r?.enrolled ?? 0));
  const capacity = rows.map((r) => Number(r?.capacity ?? 0));

  const chartData = labels.length
    ? {
        labels,
        datasets: [
          { label: 'Enrolled Students', data: enrolled, backgroundColor: 'rgba(99,102,241,0.6)' },
          { label: 'Capacity', data: capacity, backgroundColor: 'rgba(16,185,129,0.6)' }
        ]
      }
    : makeData('Enrolled Students');

  return <Bar data={chartData} options={mergeOptions(options)} />;
};

export const CoursePerformanceChart = ({ data, options = {} }) => {
  const rows = safeArray(data);
  const labels = rows.map((r) => r?.performance ?? '').filter((l) => l !== '');
  const counts = rows.map((r) => Number(r?.count ?? 0));

  const chartData = labels.length
    ? {
        labels,
        datasets: [
          {
            label: 'Course Performance',
            data: counts,
            backgroundColor: ['#34d399', '#60a5fa', '#fbbf24', '#f87171']
          }
        ]
      }
    : makeData('Course Performance');

  return <Doughnut data={chartData} options={mergeOptions(options)} />;
};

export const CapacityUtilizationChart = ({ data, options = {} }) => {
  const rows = safeArray(data);
  const labels = rows.map((r) => r?.utilization ?? '').filter((l) => l !== '');
  const counts = rows.map((r) => Number(r?.count ?? 0));

  const chartData = labels.length
    ? {
        labels,
        datasets: [
          {
            label: 'Capacity Utilization',
            data: counts,
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
          }
        ]
      }
    : makeData('Capacity Utilization');

  return <Pie data={chartData} options={mergeOptions(options)} />;
};

export const AttendancePerformanceChart = ({ data, options = {} }) => {
  const rows = safeArray(data);
  const labels = rows.map((r) => String(r?.attendance ?? '')).filter((l) => l !== '');
  const performance = rows.map((r) => Number(r?.performance ?? 0));
  const attendance = rows.map((r) => Number(r?.attendance ?? 0));

  const chartData = labels.length
    ? {
        labels,
        datasets: [
          { label: 'Attendance vs Performance', data: performance, borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.2)' },
          { label: 'Attendance', data: attendance, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.2)' }
        ]
      }
    : makeData('Attendance vs Performance');

  return <Line data={chartData} options={mergeOptions(options)} />;
};

export const MonthlyComparisonChart = ({ data, options = {} }) => {
  const rows = safeArray(data);
  const labels = rows.map((r) => r?.month ?? '').filter((l) => l !== '');
  const thisYear = rows.map((r) => Number(r?.thisYear ?? 0));
  const lastYear = rows.map((r) => Number(r?.lastYear ?? 0));

  const chartData = labels.length
    ? {
        labels,
        datasets: [
          { label: 'This Year', data: thisYear, backgroundColor: 'rgba(37,99,235,0.6)' },
          { label: 'Last Year', data: lastYear, backgroundColor: 'rgba(107,114,128,0.6)' }
        ]
      }
    : makeData('This Year');

  return <Bar data={chartData} options={mergeOptions(options)} />;
};