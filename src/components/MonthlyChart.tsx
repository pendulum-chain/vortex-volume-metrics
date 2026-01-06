"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import type { DateRange } from 'react-day-picker';
import type { MonthlyData } from '../App';

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

const chainColors = ['#1d4ed8', '#ea580c', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

interface MonthlyChartProps {
  monthlyDataRaw: MonthlyData[];
  dateRange: DateRange | undefined;
}

export function MonthlyChart({ monthlyDataRaw: monthlyData }: MonthlyChartProps) {
  console.log('MonthlyChart monthlyData:', monthlyData);

  const total = monthlyData.reduce((acc, curr) => acc + curr.chains.reduce((acc, chain) => acc + chain.total_usd, 0), 0);

  const uniqueChains = new Set<string>();
  monthlyData.forEach(month => month.chains.forEach(chain => uniqueChains.add(chain.chain)));
  const chainArray = Array.from(uniqueChains);

  const chartConfig: ChartConfig = {};
  chainArray.forEach((chain, i) => {
    chartConfig[chain] = {
      label: chain,
      color: chainColors[i % chainColors.length],
    };
  });

  const transformedData = monthlyData.map(month => {
    const obj: any = { month : month.month };
    month.chains.forEach(chain => {
      obj[chain.chain] = chain.total_usd;
    });
    return obj;
  });

  console.log('Transformed monthly chart data:', transformedData);
  
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
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 md:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-4 border-b md:border-b-0 md:px-6 md:py-6">
          <CardTitle className="text-lg text-vortex-950">Monthly Volumes</CardTitle>
          <CardDescription className="text-vortex-800">
            {firstFormatted} to {lastFormatted}
          </CardDescription>
        </div>
        <div className="flex flex-col md:flex-row">
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
