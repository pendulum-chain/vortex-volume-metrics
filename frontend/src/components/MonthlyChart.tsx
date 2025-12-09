"use client"

import { useState, useEffect } from 'react';
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
  volume: {
    label: 'Volume',
    color: '#1e40af', // vortex-800 from config
  },
} satisfies ChartConfig;

interface MonthlyData {
  month: string;
  volume: number;
}

interface ApiResponse {
  monthly: MonthlyData[];
  weekly: { week: string; volume: number }[];
  selectedMonth: string;
}

export function MonthlyChart() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/volumes`);
        const result: ApiResponse = await response.json();
        setData(result.monthly);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const total = data.reduce((acc, curr) => acc + curr.volume, 0);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle className="text-lg text-vortex-950">Monthly Volumes</CardTitle>
          <CardDescription className="text-vortex-800">
            Showing monthly volumes for 2025
          </CardDescription>
        </div>
        <div className="flex">
          <div className="flex flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-vortex-800 text-xs">Total Volume</span>
            <span className="text-vortex-950 text-lg leading-none font-bold sm:text-3xl">
              {total.toLocaleString()}
            </span>
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
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => {
                // Parse YYYY-MM format without timezone issues
                const [year, month] = value.split('-').map(Number);
                const date = new Date(year, month - 1, 1);
                return date.toLocaleDateString('en-US', { month: 'short' });
              }}
            />
            <ChartTooltip
              cursor={false}
              animationDuration={0}
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="volume"
                  labelFormatter={(value: string) => {
                    // Parse YYYY-MM format without timezone issues
                    const [year, month] = value.split('-').map(Number);
                    const date = new Date(year, month - 1, 1);
                    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  }}
                />
              }
            />
            <Bar dataKey="volume" fill="var(--color-volume)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
