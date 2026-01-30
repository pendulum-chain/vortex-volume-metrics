import {useState, useEffect} from 'react';
import {WeeklyChart} from './components/WeeklyChart'
import {MonthlyChart} from './components/MonthlyChart'
import {SkeletonChart} from './components/SkeletonChart'
import {MaintenancePage} from './components/MaintenancePage'
import {PageLayout} from './components/PageLayout';
import type {DateRange} from 'react-day-picker';

// Maintenance mode flag - set to false to restore normal operation
const MAINTENANCE_MODE = true;

export interface ChainVolume {
    chain: string;
    buy_usd: number;
    sell_usd: number;
    total_usd: number;
}

export interface DailyVolume {
    day: string;
    chains: ChainVolume[];
}

export interface MonthlyData {
    month: string;
    chains: ChainVolume[];
}

export interface WeeklyData {
    week: string;
    startDate: string;
    endDate: string;
    chains: ChainVolume[];
}

export interface ApiResponse {
    monthly: MonthlyData[];
    weekly: WeeklyData[];
    startDate: string;
    endDate: string;
}

function App() {
    const currentDate = new Date();
    const threeMonthsAgo = new Date(currentDate);
    threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

    const [data, setData] = useState<ApiResponse | null>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: threeMonthsAgo,
        to: currentDate,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [lastFetchedKey, setLastFetchedKey] = useState<string | null>(null);

    const fetchData = async (start: string, end: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/v1/metrics/volumes?start=${start}&end=${end}`);
            const result: ApiResponse = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            const start = dateRange.from.toISOString().slice(0, 10);
            const end = dateRange.to.toISOString().slice(0, 10);
            const key = `${start}-${end}`;
            if (key !== lastFetchedKey) {
                fetchData(start, end);
                setLastFetchedKey(key);
            }
        }
    }, [dateRange]);

    // Maintenance mode takes priority over all other states
    if (MAINTENANCE_MODE) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-white to-blue-100">
                <div className="container mx-auto p-4">
                    <div className="items-center gap-2 mb-4">
                        <img src={logo} alt="Vortex Logo"/>
                        <h1 className="ml-0.5 font-bold text-blue-800 uppercase">Ramp Volume</h1>
                    </div>
                    <MaintenancePage/>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <PageLayout>
                <div className="space-y-8">
                    <SkeletonChart/>
                    <SkeletonChart/>
                </div>
            </PageLayout>
        );
    }

    if (error) {
        return (
            <PageLayout>
                <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                    <div className="mb-2 text-red-500">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mx-auto"
                        >
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" x2="12" y1="8" y2="12"/>
                            <line x1="12" x2="12.01" y1="16" y2="16"/>
                        </svg>
                    </div>
                    <h3 className="mb-1 text-lg font-semibold text-red-900">Data Unavailable</h3>
                    <p className="mb-4 text-sm text-red-700">
                        We couldn't load the volume metrics properly. Please try again later.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="rounded bg-white px-4 py-2 text-sm font-medium text-red-900 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
                    >
                        Retry
                    </button>
                </div>
            </PageLayout>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <PageLayout>
            <div className="space-y-8">
                {MAINTENANCE_MODE ? (
                    <MaintenancePage/>
                ) : (
                    <>
                        <MonthlyChart monthlyDataRaw={data.monthly}/>
                        <WeeklyChart weeklyDataRaw={data.weekly} dateRange={dateRange} setDateRange={setDateRange}/>
                    </>
                )}
            </div>
        </PageLayout>
    );
}

export default App;
