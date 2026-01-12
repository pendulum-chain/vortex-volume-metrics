"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import type { MonthlyData } from '../App';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartLegendContent,
} from './ui/chart';
import { ChartTooltipContent } from './ui/helpers';
import { calculateTotalVolume, extractChainArray, buildChartConfig, getBarRadius } from '../lib/chartUtils';

interface MonthlyChartProps {
  monthlyDataRaw: MonthlyData[];
}

export function MonthlyChart({ monthlyDataRaw: monthlyData }: MonthlyChartProps) {
  const total = calculateTotalVolume(monthlyData);
  const chainArray = extractChainArray(monthlyData);
  const chartConfig = buildChartConfig(chainArray);

  const transformedData = monthlyData.map(month => {
    const obj: Record<string, string | number> = { month: month.month };
    month.chains.forEach(chain => {
      obj[chain.chain] = chain.total_usd;
    });
    return obj;
  });

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const firstMonth = monthlyData[0]?.month;
  const lastMonth = monthlyData[monthlyData.length - 1]?.month;
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
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart accessibilityLayer data={transformedData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => {
                const [year, month] = value.split('-').map(Number);
                const date = new Date(year, month - 1, 1);
                return date.toLocaleDateString('en-US', { month: 'short' });
              }}
            />
            <ChartTooltip cursor={false} animationDuration={0} content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {chainArray.map((chain, index) => (
              <Bar
                key={chain}
                dataKey={chain}
                stackId="a"
                fill={`var(--color-${chain})`}
                radius={getBarRadius(index, chainArray.length)}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
