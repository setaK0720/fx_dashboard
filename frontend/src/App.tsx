import { ChakraProvider, defaultSystem, SimpleGrid, Box } from '@chakra-ui/react'
import { DashboardLayout } from './components/Layout/DashboardLayout'
import { RatePanel } from './features/dashboard/RatePanel'
import { ChartWidget } from './features/dashboard/ChartWidget'
import { PositionTable } from './features/dashboard/PositionTable'
import { OrderForm } from './features/dashboard/OrderForm'
import { BacktestPanel } from './features/dashboard/BacktestPanel'
import { AccountPanel } from './features/account/AccountPanel'
import { useState } from 'react'

import { Toaster } from './components/ui/toaster'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')

  return (
    <ChakraProvider value={defaultSystem}>
      <DashboardLayout currentView={currentView} onNavigate={setCurrentView}>
        {currentView === 'dashboard' ? (
          <>
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
          </>
        ) : (
          <AccountPanel />
        )}
      </DashboardLayout>
      <Toaster />
    </ChakraProvider>
  )
}

export default App






