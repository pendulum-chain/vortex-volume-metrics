export interface MonthlyVolume {
  month: string;
  volume: number;
}

export interface DailyVolume {
  day: string;
  buy_usd: number;
  sell_usd: number;
  total_usd: number;
}

export interface WeeklyVolume {
  week: string;
  startDate: string;
  endDate: string;
  volume: number;
}

export interface VolumeData {
  monthly: MonthlyVolume[];
  weekly: WeeklyVolume[];
  daily: DailyVolume[];
  selectedMonth: string;
}
