"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
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

const chartConfig = {
  total_usd: {
    label: 'Volume',
    color: '#1e40af', // vortex-800 from config
  },
} satisfies ChartConfig;

interface MonthlyData {
  month: string;
  buy_usd: number;
  sell_usd: number;
  total_usd: number;
}

interface MonthlyChartProps {
  monthlyData: MonthlyData[];
  dateRange: DateRange | undefined;
}

export function MonthlyChart({ monthlyData, dateRange }: MonthlyChartProps) {
  const total = monthlyData.reduce((acc, curr) => acc + curr.total_usd, 0);

  const firstMonth = monthlyData[0]?.month;
  const lastMonth = monthlyData[monthlyData.length - 1]?.month;
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  const firstFormatted = firstMonth ? formatMonth(firstMonth) : '';
  const lastFormatted = lastMonth ? formatMonth(lastMonth) : '';

  return (
    <Card>
      <CardHeader className="flex flex-row items-stretch space-y-0 border-b p-0">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-6">
          <CardTitle className="text-lg text-vortex-950">Monthly Volumes</CardTitle>
          <CardDescription className="text-vortex-800">
            {firstFormatted} to {lastFormatted}
          </CardDescription>
        </div>
        <div className="flex">
          <div className="flex flex-col justify-center gap-1 border-l px-8 py-6 text-left">
            <span className="text-vortex-800 text-xs">Total Volume</span>
            <span className="text-vortex-950 text-3xl leading-none font-bold">
              {total.toLocaleString()}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={monthlyData}
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
                  nameKey="total_usd"
                  labelFormatter={(value: string) => {
                    // Parse YYYY-MM format without timezone issues
                    const [year, month] = value.split('-').map(Number);
                    const date = new Date(year, month - 1, 1);
                    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  }}
                />
              }
            />
            <Bar dataKey="total_usd" fill="var(--color-total_usd)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
