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

async function getDailyVolumes(startDate: string, endDate: string): Promise<DailyVolume[]> {
  const cacheKey = `daily-${startDate}-${endDate}`;
  const cached = cache.get<DailyVolume[]>(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase.rpc('get_daily_volumes', { start_date: startDate, end_date: endDate });
    console.log('DEBUG - RPC data: ', data);
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

    const start = new Date(startDate);
    const end = new Date(endDate);
    const volumes: DailyVolume[] = [];
    const current = new Date(start);
    while (current <= end) {
      const dayStr = current.toISOString().slice(0, 10);
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
      current.setDate(current.getDate() + 1);
    }

    cache.set(cacheKey, volumes, 5 * 60);
    return volumes;
  } catch (rpcError: any) {
    throw new Error('Could not calculate daily volumes: ' + rpcError.message);
  }
}

function aggregateWeekly(daily: DailyVolume[], startDate: string, endDate: string): WeeklyVolume[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const numWeeks = Math.ceil(totalDays / 7);

  const weeks: { [key: string]: { volume: number; startDate: Date; endDate: Date } } = {};
  for (let i = 1; i <= numWeeks; i++) {
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + (i - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    if (weekEnd > end) {
      weekEnd.setTime(end.getTime());
    }
    weeks[`Week ${i}`] = {
      volume: 0,
      startDate: weekStart,
      endDate: weekEnd,
    };
  }

  // Aggregate daily volumes into weeks
  daily.forEach(d => {
    const dayDate = new Date(d.day);
    const daysDiff = Math.floor((dayDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const weekNum = Math.floor(daysDiff / 7) + 1;
    const weekKey = `Week ${weekNum}`;
    if (weeks[weekKey] !== undefined) {
      weeks[weekKey].volume += d.total_usd;
    }
  });

  return Object.entries(weeks)
    .sort((a, b) => {
      const weekA = parseInt(a[0].replace('Week ', ''));
      const weekB = parseInt(b[0].replace('Week ', ''));
      return weekA - weekB;
    })
    .map(([week, data]) => {
      const startMonth = data.startDate.toLocaleString('en-US', { month: 'short' });
      const startDay = data.startDate.getDate();
      const endMonth = data.endDate.toLocaleString('en-US', { month: 'short' });
      const endDay = data.endDate.getDate();
      const weekLabel = `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
      return {
        week: weekLabel,
        startDate: data.startDate.toISOString().slice(0, 10),
        endDate: data.endDate.toISOString().slice(0, 10),
        volume: data.volume
      };
    });
}

async function getWeeklyVolumes(startDate: string, endDate: string): Promise<WeeklyVolume[]> {
  const cacheKey = `weekly-${startDate}-${endDate}`;
  const cached = cache.get<WeeklyVolume[]>(cacheKey);
  if (cached) return cached;

  const daily = await getDailyVolumes(startDate, endDate);
  const weekly = aggregateWeekly(daily, startDate, endDate);
  cache.set(cacheKey, weekly, 5 * 60);
  return weekly;
}



app.get('/volumes', async (req, res) => {
  try {
    const { month, start, end } = req.query;
    let startDate: string;
    let endDate: string;
    let selectedMonth: string | undefined;

    if (start && end) {
      startDate = start as string;
      endDate = end as string;
    } else {
      selectedMonth = (month as string) || new Date().toISOString().slice(0, 7); // YYYY-MM
      startDate = `${selectedMonth}-01`;
      const monthDate = new Date(selectedMonth + '-01');
      monthDate.setMonth(monthDate.getMonth() + 1);
      monthDate.setDate(0);
      endDate = monthDate.toISOString().slice(0, 10);
    }

    const year = new Date().getFullYear();
    console.log('Fetching volumes for period:', startDate, 'to', endDate);
    const [monthly, weekly, daily] = await Promise.all([
      getMonthlyVolumes(year),
      getWeeklyVolumes(startDate, endDate),
      getDailyVolumes(startDate, endDate),
    ]);

    res.json({
      monthly,
      weekly,
      daily,
      selectedMonth,
      startDate,
      endDate,
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
