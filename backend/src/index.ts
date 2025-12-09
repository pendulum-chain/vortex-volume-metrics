import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Mock data for volumes
const mockMonthlyData = [
  { month: '2025-01', volume: 1200 },
  { month: '2025-02', volume: 1500 },
  { month: '2025-03', volume: 1800 },
  { month: '2025-04', volume: 1400 },
  { month: '2025-05', volume: 1600 },
  { month: '2025-06', volume: 1900 },
  { month: '2025-07', volume: 1700 },
  { month: '2025-08', volume: 2000 },
  { month: '2025-09', volume: 2100 },
  { month: '2025-10', volume: 1800 },
  { month: '2025-11', volume: 2200 },
  { month: '2025-12', volume: 2500 },
];

const mockWeeklyData = {
  '2025-10': [
    { week: 'Week 1', volume: 400 },
    { week: 'Week 2', volume: 450 },
    { week: 'Week 3', volume: 380 },
    { week: 'Week 4', volume: 420 },
    { week: 'Week 5', volume: 150 }, // partial week
  ],
  '2025-11': [
    { week: 'Week 1', volume: 500 },
    { week: 'Week 2', volume: 550 },
    { week: 'Week 3', volume: 480 },
    { week: 'Week 4', volume: 520 },
    { week: 'Week 5', volume: 150 },
  ],
  '2025-12': [
    { week: 'Week 1', volume: 600 },
    { week: 'Week 2', volume: 650 },
    { week: 'Week 3', volume: 580 },
    { week: 'Week 4', volume: 620 },
    { week: 'Week 5', volume: 50 },
  ],
};

app.get('/volumes', (req, res) => {
  const { month } = req.query;
  const currentMonth = month || new Date().toISOString().slice(0, 7); // YYYY-MM

  const weeklyData = mockWeeklyData[currentMonth as keyof typeof mockWeeklyData] || mockWeeklyData['2025-10'];

  res.json({
    monthly: mockMonthlyData,
    weekly: weeklyData,
    selectedMonth: currentMonth,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
