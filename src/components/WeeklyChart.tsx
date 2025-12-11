"use client"

import { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import type { ChartConfig } from './ui/chart';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from './ui/chart';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

const chartConfig = {
  volume: {
    label: 'Volume',
    color: '#1e40af', // vortex-800 from config
  },
} satisfies ChartConfig;

interface WeeklyData {
  week: string;
  startDate: string;
  endDate: string;
  volume: number;
}

interface ApiResponse {
  monthly: { month: string; volume: number }[];
  weekly: WeeklyData[];
  startDate: string;
  endDate: string;
}

export function WeeklyChart() {
  const currentDate = new Date();
  const threeMonthsAgo = new Date(currentDate);
  threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

  const [data, setData] = useState<WeeklyData[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: threeMonthsAgo,
    to: currentDate,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async (start: string, end: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/v1/metrics/volumes?start=${start}&end=${end}`);
      const result: ApiResponse = await response.json();
      setData(result.weekly);
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
      fetchData(start, end);
    }
  }, [dateRange]);

  const total = data.reduce((acc, curr) => acc + curr.volume, 0);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle className="text-vortex-950">Weekly Volumes</CardTitle>
          <CardDescription className="text-vortex-800">
            Showing weekly volumes from {dateRange?.from ? format(dateRange.from, 'PPP') : ''} to {dateRange?.to ? format(dateRange.to, 'PPP') : ''}
          </CardDescription>
        </div>
        <div className="flex">
          <div className="flex flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-vortex-800 text-xs">Total Volume</span>
            <span className="text-vortex-950 text-lg leading-none font-bold sm:text-3xl">
              {total.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col justify-center gap-1 border-t px-6 py-4 sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
            <label className="text-vortex-800 text-xs">Select Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="flex h-9 w-[280px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd, y')} -{' '}
                        {format(dateRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <ChartTooltip
              cursor={false}
              animationDuration={0}
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="volume"
                  labelFormatter={(value: string) => value}
                />
              }
            />
            <Bar dataKey="volume" fill="var(--color-volume)" maxBarSize={78} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
