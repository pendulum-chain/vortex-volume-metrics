import type { ChartConfig } from '../components/ui/chart';
import { chainColors, chartAnimation } from './constants';

interface ChainData {
  chains: { chain: string; total_usd: number }[];
}

export function calculateTotalVolume<T extends ChainData>(data: T[]): number {
  return data.reduce(
    (acc, item) => acc + item.chains.reduce((sum, chain) => sum + chain.total_usd, 0),
    0
  );
}

function sortChainsByTotal(chainTotals: Map<string, number>): string[] {
  return Array.from(chainTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([chain]) => chain);
}

export function extractChainArray<T extends ChainData>(data: T[]): string[] {
  const chainTotals = new Map<string, number>();
  data.forEach(item => {
    item.chains.forEach(chain => {
      chainTotals.set(chain.chain, (chainTotals.get(chain.chain) ?? 0) + chain.total_usd);
    });
  });


  return sortChainsByTotal(chainTotals);
}

export function buildChartConfig(chainArray: string[]): ChartConfig {
  const config: ChartConfig = {};
  chainArray.forEach(chain => {
    config[chain] = {
      label: chain,
      color: chainColors[chain] ?? '#808080',
    };
  });
  return config;
}

export function getBarRadius(index: number, total: number): [number, number, number, number] {
  if (index === 0) return [0, 0, 4, 4];
  if (index === total - 1) return [4, 4, 0, 0];
  return [0, 0, 0, 0];
}

export interface BarAnimationProps {
  isAnimationActive: boolean;
  animationDuration?: number;
  animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  animationBegin?: number;
}

export function getBarAnimationProps(index: number, reducedMotion: boolean): BarAnimationProps {
  if (reducedMotion) {
    return { isAnimationActive: false };
  }
  return {
    isAnimationActive: true,
    animationDuration: chartAnimation.duration,
    animationEasing: chartAnimation.easing,
    animationBegin: index * chartAnimation.staggerDelay,
  };
}
