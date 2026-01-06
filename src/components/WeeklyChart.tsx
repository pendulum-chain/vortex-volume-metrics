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

const chainColors = ['#1d4ed8', '#ea580c', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];


interface WeeklyChartProps {
  weeklyDataRaw: WeeklyData[];
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
}

export function WeeklyChart({ weeklyDataRaw: weeklyData, dateRange, setDateRange }: WeeklyChartProps) {
  console.log('WeeklyChart weeklyData:', weeklyData);

  const total = weeklyData.reduce((acc, curr) => acc + curr.chains.reduce((acc, chain) => acc + chain.total_usd, 0), 0);

  const uniqueChains = new Set<string>();
  weeklyData.forEach(week => week.chains.forEach(chain => uniqueChains.add(chain.chain)));
  const chainArray = Array.from(uniqueChains);

  const chartConfig: ChartConfig = {};
  chainArray.forEach((chain, i) => {
    chartConfig[chain] = {
      label: chain,
      color: chainColors[i % chainColors.length],
    };
  });

  const transformedData = weeklyData.map(week => {
    const obj: any = { week: week.week };
    week.chains.forEach(chain => {
      obj[chain.chain] = chain.total_usd;
    });
    return obj;
  });

  console.log('Transformed weekly chart data:', transformedData);

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
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 md:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-4 border-b md:border-b-0 md:px-6 md:py-6">
          <CardTitle className="text-vortex-950">Weekly Volumes</CardTitle>
          <CardDescription className="text-vortex-800">
            {dateRange?.from ? format(dateRange.from, 'PPP') : ''} - {dateRange?.to ? format(dateRange.to, 'PPP') : ''}
          </CardDescription>
        </div>
        <div className="flex flex-col md:flex-row">
          <div className="flex flex-col justify-center gap-1 px-6 py-4 border-b md:border-b-0 md:px-8 md:py-6">
            <label className="text-vortex-800 text-xs">Select Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="flex h-9 w-full md:w-[280px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 justify-start text-left font-normal"
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
          <div className="flex flex-col justify-center gap-1 px-6 py-4 text-left min-w-[200px] md:border-l md:px-8 md:py-6">
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
            data={transformedData}
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
              content={<ChartTooltipContent hideLabel />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            {chainArray.map((chain, index) => {
              const isFirst = index === 0;
              const isLast = index === chainArray.length - 1;
              const radius = isFirst ? [0, 0, 4, 4] as [number, number, number, number] : isLast ? [4, 4, 0, 0] as [number, number, number, number] : [0, 0, 0, 0] as [number, number, number, number];
              return (
                <Bar
                  key={chain}
                  dataKey={chain}
                  stackId="a"
                  fill={`var(--color-${chain})`}
                  radius={radius}
                />
              );
            })}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
