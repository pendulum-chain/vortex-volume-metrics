import { WeeklyChart } from './components/WeeklyChart'
import { MonthlyChart } from './components/MonthlyChart'

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="space-y-8">
        <MonthlyChart />
        <WeeklyChart />
      </div>
    </div>
  )
}

export default App
