import express from 'express';
import cors from 'cors';
import NodeCache from 'node-cache';
import { supabase } from './config.js';
import type { MonthlyVolume, DailyVolume, WeeklyVolume, VolumeData } from './types.js';

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

const cache = new NodeCache();

async function getMonthlyVolumes(year: number): Promise<MonthlyVolume[]> {
  const cacheKey = `monthly-${year}`;
  const cached = cache.get<MonthlyVolume[]>(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase.rpc('get_monthly_volumes', { year_param: year });

    if (error) throw error;

    // Create a map of existing data
    const dataMap = new Map<string, number>();
    data.forEach((row: any) => {
      dataMap.set(row.month, parseFloat(row.volume));
    });

    // Fill in all months of the year up to current month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    
    // Determine how many months to show
    const maxMonth = year === currentYear ? currentMonth : 12;
    
    const volumes: MonthlyVolume[] = [];
    for (let month = 1; month <= maxMonth; month++) {
      const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
      const volume = dataMap.get(monthStr) ?? 0;
      volumes.push({ month: monthStr, volume });
    }

    // TTL 5 minutes since current year includes current month
    cache.set(cacheKey, volumes, 5 * 60);
    return volumes;
  } catch (rpcError: any) {
    throw new Error('Could not calculate monthly volumes: ' + rpcError.message);
  }
}

async function getDailyVolumes(month: string): Promise<DailyVolume[]> {
  const cacheKey = `daily-${month}`;
  const cached = cache.get<DailyVolume[]>(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase.rpc('get_daily_volumes', { month_param: month });
    console.log('RPC data: ', data);
    if (error) throw error;

    // Create a map of existing data
    const dataMap = new Map<string, DailyVolume>();
    data.forEach((row: any) => {
      dataMap.set(row.day, {
        day: row.day,
        buy_usd: parseFloat(row.buy_usd),
        sell_usd: parseFloat(row.sell_usd),
        total_usd: parseFloat(row.total_usd),
      });
    });

    // Fill in all days of the month
    const parts = month.split('-').map(Number);
    const year = parts[0] ?? new Date().getFullYear();
    const monthNum = parts[1] ?? 1;
    const lastDayOfMonth = new Date(year, monthNum, 0);
    const totalDaysInMonth = lastDayOfMonth.getDate();

    const volumes: DailyVolume[] = [];
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dayStr = `${month}-${day.toString().padStart(2, '0')}`;
      const existing = dataMap.get(dayStr);
      if (existing) {
        volumes.push(existing);
      } else {
        volumes.push({
          day: dayStr,
          buy_usd: 0,
          sell_usd: 0,
          total_usd: 0,
        });
      }
    }

    cache.set(cacheKey, volumes, 5 * 60);
    return volumes;
  } catch (rpcError: any) {
    throw new Error('Could not calculate daily volumes: ' + rpcError.message);
  }
}

function aggregateWeekly(daily: DailyVolume[], month: string): WeeklyVolume[] {
  // Get the first day of the month
  const parts = month.split('-').map(Number);
  const year = parts[0] ?? new Date().getFullYear();
  const monthNum = parts[1] ?? 1;
  const lastDayOfMonth = new Date(year, monthNum, 0);
  const totalDaysInMonth = lastDayOfMonth.getDate();
  
  // Calculate number of weeks in the month (a week is any 7-day period starting from day 1)
  const numWeeks = Math.ceil(totalDaysInMonth / 7);
  
  // Initialize weeks with 0 volume
  const weeks: { [key: string]: number } = {};
  for (let i = 1; i <= numWeeks; i++) {
    weeks[`Week ${i}`] = 0;
  }
  
  // Aggregate daily volumes into weeks
  daily.forEach(d => {
    // Parse YYYY-MM-DD format without timezone issues
    const dayParts = d.day.split('-').map(Number);
    const dayOfMonth = dayParts[2] ?? 1;
    // Week 1: days 1-7, Week 2: days 8-14, etc.
    const weekNum = Math.ceil(dayOfMonth / 7);
    const weekKey = `Week ${weekNum}`;
    const currentValue = weeks[weekKey] ?? 0;
    weeks[weekKey] = currentValue + d.total_usd;
  });
  
  return Object.entries(weeks)
    .sort((a, b) => {
      const weekA = parseInt(a[0].replace('Week ', ''));
      const weekB = parseInt(b[0].replace('Week ', ''));
      return weekA - weekB;
    })
    .map(([week, volume]) => ({ week, volume }));
}

async function getWeeklyVolumes(month: string): Promise<WeeklyVolume[]> {
  const cacheKey = `weekly-${month}`;
  const cached = cache.get<WeeklyVolume[]>(cacheKey);
  if (cached) return cached;

  const daily = await getDailyVolumes(month);
  const weekly = aggregateWeekly(daily, month);
  cache.set(cacheKey, weekly, 5 * 60);
  return weekly;
}



app.get('/volumes', async (req, res) => {
  try {
    const { month } = req.query;
    const selectedMonth = (month as string) || new Date().toISOString().slice(0, 7); // YYYY-MM
    const year = new Date().getFullYear();
    console.log('Fetching volumes for month:', selectedMonth);
    const [monthly, weekly, daily] = await Promise.all([
      getMonthlyVolumes(year),
      getWeeklyVolumes(selectedMonth),
      getDailyVolumes(selectedMonth),
    ]);

    res.json({
      monthly,
      weekly,
      daily,
      selectedMonth,
    });
  } catch (error) {
    console.error('Error fetching volumes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
