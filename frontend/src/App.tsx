import { WeeklyChart } from './components/WeeklyChart'
import { MonthlyChart } from './components/MonthlyChart'
import { DailyChart } from './components/DailyChart'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-vortex-50 to-white">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4 text-vortex-950">Vortex Ramp Volume</h1>
        <div className="space-y-8">
          <MonthlyChart />
          <WeeklyChart />
          <DailyChart />
        </div>
      </div>
    </div>
  )
}

export default App
