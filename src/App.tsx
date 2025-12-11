import { useState, useEffect, useRef } from 'react';
import { WeeklyChart } from './components/WeeklyChart'
import { MonthlyChart } from './components/MonthlyChart'
import type { DateRange } from 'react-day-picker';

interface WeeklyData {
  week: string;
  startDate: string;
  endDate: string;
  volume: number;
}

interface MonthlyData {
  month: string;
  buy_usd: number;
  sell_usd: number;
  total_usd: number;
}

interface ApiResponse {
  monthly: MonthlyData[];
  weekly: WeeklyData[];
  startDate: string;
  endDate: string;
}

function App() {
  const currentDate = new Date();
  const threeMonthsAgo = new Date(currentDate);
  threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

  const [data, setData] = useState<ApiResponse | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: threeMonthsAgo,
    to: currentDate,
  });
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef<Set<string>>(new Set());

  const fetchData = async (start: string, end: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/v1/metrics/volumes?start=${start}&end=${end}`);
      const result: ApiResponse = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const start = dateRange.from.toISOString().slice(0, 10);
      const end = dateRange.to.toISOString().slice(0, 10);
      const key = `${start}-${end}`;
      if (!fetchedRef.current.has(key)) {
        fetchedRef.current.add(key);
        fetchData(start, end);
      }
    }
  }, [dateRange]);

  if (loading || !data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-vortex-50 to-white min-w-[700px]">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4 text-vortex-950">Vortex Ramp Volume</h1>
        <div className="space-y-8">
          <MonthlyChart monthlyData={data?.monthly || []} dateRange={dateRange} />
          <WeeklyChart weeklyData={data?.weekly || []} dateRange={dateRange} setDateRange={setDateRange} />
        </div>
      </div>
    </div>
  )
}

export default App
