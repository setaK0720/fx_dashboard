import { ChakraProvider, defaultSystem, SimpleGrid, Box } from '@chakra-ui/react'
import { DashboardLayout } from './components/Layout/DashboardLayout'
import { RatePanel } from './features/dashboard/RatePanel'
import { ChartWidget } from './features/dashboard/ChartWidget'
import { PositionTable } from './features/dashboard/PositionTable'
import { OrderForm } from './features/dashboard/OrderForm'
import { BacktestPanel } from './features/dashboard/BacktestPanel'

function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <DashboardLayout>
        <RatePanel />
        <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6} mb={6}>
          <Box gridColumn={{ lg: "span 2" }}>
            <ChartWidget />
          </Box>
          <Box>
            <OrderForm />
          </Box>
        </SimpleGrid>
        <Box mb={6}>
          <BacktestPanel />
        </Box>
        <PositionTable />
      </DashboardLayout>
    </ChakraProvider>
  )
}

export default App






