import type { ChartConfig } from '../components/ui/chart';
import { chainColors } from './constants';

interface ChainData {
  chains: { chain: string; total_usd: number }[];
}

export function calculateTotalVolume<T extends ChainData>(data: T[]): number {
  return data.reduce(
    (acc, item) => acc + item.chains.reduce((sum, chain) => sum + chain.total_usd, 0),
    0
  );
}

export function extractChainArray<T extends ChainData>(data: T[]): string[] {
  const uniqueChains = new Set<string>();
  data.forEach(item => item.chains.forEach(chain => uniqueChains.add(chain.chain)));
  return Array.from(uniqueChains).sort();
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
