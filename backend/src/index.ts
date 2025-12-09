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

const mockDailyData = {
  '2025-10': [
    { day: '2025-10-01', volume: 120 },
    { day: '2025-10-02', volume: 135 },
    { day: '2025-10-03', volume: 110 },
    { day: '2025-10-04', volume: 145 },
    { day: '2025-10-05', volume: 130 },
    { day: '2025-10-06', volume: 125 },
    { day: '2025-10-07', volume: 140 },
    { day: '2025-10-08', volume: 115 },
    { day: '2025-10-09', volume: 150 },
    { day: '2025-10-10', volume: 135 },
    { day: '2025-10-11', volume: 120 },
    { day: '2025-10-12', volume: 145 },
    { day: '2025-10-13', volume: 130 },
    { day: '2025-10-14', volume: 125 },
    { day: '2025-10-15', volume: 140 },
    { day: '2025-10-16', volume: 115 },
    { day: '2025-10-17', volume: 150 },
    { day: '2025-10-18', volume: 135 },
    { day: '2025-10-19', volume: 120 },
    { day: '2025-10-20', volume: 145 },
    { day: '2025-10-21', volume: 130 },
    { day: '2025-10-22', volume: 125 },
    { day: '2025-10-23', volume: 140 },
    { day: '2025-10-24', volume: 115 },
    { day: '2025-10-25', volume: 150 },
    { day: '2025-10-26', volume: 135 },
    { day: '2025-10-27', volume: 120 },
    { day: '2025-10-28', volume: 145 },
    { day: '2025-10-29', volume: 130 },
    { day: '2025-10-30', volume: 125 },
    { day: '2025-10-31', volume: 140 },
  ],
  '2025-11': [
    { day: '2025-11-01', volume: 130 },
    { day: '2025-11-02', volume: 145 },
    { day: '2025-11-03', volume: 120 },
    { day: '2025-11-04', volume: 155 },
    { day: '2025-11-05', volume: 140 },
    { day: '2025-11-06', volume: 135 },
    { day: '2025-11-07', volume: 150 },
    { day: '2025-11-08', volume: 125 },
    { day: '2025-11-09', volume: 160 },
    { day: '2025-11-10', volume: 145 },
    { day: '2025-11-11', volume: 130 },
    { day: '2025-11-12', volume: 155 },
    { day: '2025-11-13', volume: 140 },
    { day: '2025-11-14', volume: 135 },
    { day: '2025-11-15', volume: 150 },
    { day: '2025-11-16', volume: 125 },
    { day: '2025-11-17', volume: 160 },
    { day: '2025-11-18', volume: 145 },
    { day: '2025-11-19', volume: 130 },
    { day: '2025-11-20', volume: 155 },
    { day: '2025-11-21', volume: 140 },
    { day: '2025-11-22', volume: 135 },
    { day: '2025-11-23', volume: 150 },
    { day: '2025-11-24', volume: 125 },
    { day: '2025-11-25', volume: 160 },
    { day: '2025-11-26', volume: 145 },
    { day: '2025-11-27', volume: 130 },
    { day: '2025-11-28', volume: 155 },
    { day: '2025-11-29', volume: 140 },
    { day: '2025-11-30', volume: 135 },
  ],
  '2025-12': [
    { day: '2025-12-01', volume: 140 },
    { day: '2025-12-02', volume: 155 },
    { day: '2025-12-03', volume: 130 },
    { day: '2025-12-04', volume: 165 },
    { day: '2025-12-05', volume: 150 },
    { day: '2025-12-06', volume: 145 },
    { day: '2025-12-07', volume: 160 },
    { day: '2025-12-08', volume: 135 },
    { day: '2025-12-09', volume: 170 },
    { day: '2025-12-10', volume: 155 },
    { day: '2025-12-11', volume: 140 },
    { day: '2025-12-12', volume: 165 },
    { day: '2025-12-13', volume: 150 },
    { day: '2025-12-14', volume: 145 },
    { day: '2025-12-15', volume: 160 },
    { day: '2025-12-16', volume: 135 },
    { day: '2025-12-17', volume: 170 },
    { day: '2025-12-18', volume: 155 },
    { day: '2025-12-19', volume: 140 },
    { day: '2025-12-20', volume: 165 },
    { day: '2025-12-21', volume: 150 },
    { day: '2025-12-22', volume: 145 },
    { day: '2025-12-23', volume: 160 },
    { day: '2025-12-24', volume: 135 },
    { day: '2025-12-25', volume: 170 },
    { day: '2025-12-26', volume: 155 },
    { day: '2025-12-27', volume: 140 },
    { day: '2025-12-28', volume: 165 },
    { day: '2025-12-29', volume: 150 },
    { day: '2025-12-30', volume: 145 },
    { day: '2025-12-31', volume: 160 },
  ],
};

app.get('/volumes', (req, res) => {
  const { month } = req.query;
  const currentMonth = month || new Date().toISOString().slice(0, 7); // YYYY-MM

  const weeklyData = mockWeeklyData[currentMonth as keyof typeof mockWeeklyData] || mockWeeklyData['2025-10'];
  const dailyData = mockDailyData[currentMonth as keyof typeof mockDailyData] || mockDailyData['2025-10'];

  res.json({
    monthly: mockMonthlyData,
    weekly: weeklyData,
    daily: dailyData,
    selectedMonth: currentMonth,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
