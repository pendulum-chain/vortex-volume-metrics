"use client"

import React, { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

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

const chartConfig = {
  total_usd: {
    label: 'Volume',
    color: '#1e40af', // vortex-800 from config
  },
} satisfies ChartConfig;

interface DailyData {
  day: string;
  buy_usd: number;
  sell_usd: number;
  total_usd: number;
}

interface ApiResponse {
  monthly: { month: string; volume: number }[];
  weekly: { week: string; volume: number }[];
  daily: DailyData[];
  selectedMonth: string;
}

export function DailyChart() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const monthOptions = [];
  for (let m = currentMonth; m >= 1; m--) {
    const monthStr = m.toString().padStart(2, '0');
    const date = new Date(currentYear, m - 1, 1);
    const label = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    monthOptions.push({ value: `${currentYear}-${monthStr}`, label });
  }

  const [data, setData] = useState<DailyData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(`${currentYear}-${currentMonth.toString().padStart(2, '0')}`);
  const [loading, setLoading] = useState(true);

  const fetchData = async (month: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/volumes?month=${month}`);
      const result: ApiResponse = await response.json();
      setData(result.daily);
      setSelectedMonth(result.selectedMonth);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedMonth);
  }, [selectedMonth]);

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(event.target.value);
  };

  const total = data.reduce((acc, curr) => acc + curr.total_usd, 0);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle className="text-vortex-950">Daily Volumes</CardTitle>
          <CardDescription className="text-vortex-800">
            Showing daily volumes for {selectedMonth}
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
            <label htmlFor="month-select" className="text-vortex-800 text-xs">
              Select Month
            </label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="text-vortex-950 text-lg leading-none font-bold sm:text-3xl bg-transparent border-none outline-none"
            >
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
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
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={1}
              tickFormatter={(value: string) => {
                // Parse YYYY-MM-DD format without timezone issues
                const [year, month, day] = value.split('-').map(Number);
                return day.toString();
              }}
            />
            <ChartTooltip
              cursor={false}
              animationDuration={0}
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="total_usd"
                  labelFormatter={(value: string) => {
                    // Parse YYYY-MM-DD format without timezone issues
                    const [year, month, day] = value.split('-').map(Number);
                    const date = new Date(year, month - 1, day);
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                  }}
                />
              }
            />
            <Bar dataKey="total_usd" fill="var(--color-total_usd)" maxBarSize={40} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
