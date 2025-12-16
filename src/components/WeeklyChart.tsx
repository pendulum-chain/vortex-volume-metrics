"use client"

import { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import type { WeeklyData } from '../App';

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
  ChartLegend,
  ChartLegendContent,
} from './ui/chart';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

const chartConfig = {
  buy_usd: {
    label: 'Buy',
    color: '#1d4ed8', // vortex-700
  },
  sell_usd: {
    label: 'Sell',
    color: '#ea580c',
  },
} satisfies ChartConfig;


interface WeeklyChartProps {
  weeklyData: WeeklyData[];
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
}

export function WeeklyChart({ weeklyData, dateRange, setDateRange }: WeeklyChartProps) {
  const total = weeklyData.reduce((acc, curr) => acc + curr.buy_usd + curr.sell_usd, 0);

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-stretch space-y-0 border-b p-0">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-6">
          <CardTitle className="text-vortex-950">Weekly Volumes</CardTitle>
          <CardDescription className="text-vortex-800">
            {dateRange?.from ? format(dateRange.from, 'PPP') : ''} - {dateRange?.to ? format(dateRange.to, 'PPP') : ''}
          </CardDescription>
        </div>
        <div className="flex">
          <div className="flex flex-col justify-center gap-1 px-8 py-6">
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
          <div className="flex flex-col justify-center gap-1 border-l px-8 py-6 text-left min-w-[200px]">
            <span className="text-vortex-800 text-xs">Total Volume</span>
            <span className="text-vortex-950 text-3xl leading-none font-bold">
              ${total.toLocaleString()}
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
            data={weeklyData}
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
                  hideLabel={!isSmallScreen}
                  labelFormatter={(value) => isSmallScreen ? `Week: ${value}` : ''}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="buy_usd"
              stackId="a"
              fill="var(--color-buy_usd)"
              radius={[0, 0, 4, 4]}
              maxBarSize={78}
            />
            <Bar
              dataKey="sell_usd"
              stackId="a"
              fill="var(--color-sell_usd)"
              radius={[4, 4, 0, 0]}
              maxBarSize={78}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
