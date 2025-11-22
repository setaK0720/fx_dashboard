import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { DashboardLayout } from './components/Layout/DashboardLayout'
import { RatePanel } from './features/dashboard/RatePanel'
import { ChartWidget } from './features/dashboard/ChartWidget'
import { PositionTable } from './features/dashboard/PositionTable'

function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <DashboardLayout>
        <RatePanel />
        <ChartWidget />
        <PositionTable />
      </DashboardLayout>
    </ChakraProvider>
  )
}

export default App



