import { ChakraProvider, SimpleGrid, Box } from '@chakra-ui/react'
import { system } from './theme'
import { DashboardLayout } from './components/Layout/DashboardLayout'
import { RatePanel } from './features/dashboard/RatePanel'
import { ChartWidget } from './features/dashboard/ChartWidget'
import { PositionTable } from './features/dashboard/PositionTable'
import { OrderForm } from './features/dashboard/OrderForm'
import { BacktestPanel } from './features/dashboard/BacktestPanel'
import { AccountPanel } from './features/account/AccountPanel'
import { AccountInfoWidget } from './features/dashboard/AccountInfoWidget'
import { useState } from 'react'

import { Toaster } from './components/ui/toaster'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSD')

  return (
    <ChakraProvider value={system}>
      <DashboardLayout currentView={currentView} onNavigate={setCurrentView}>
        {currentView === 'dashboard' ? (
          <>
            <RatePanel selectedSymbol={selectedSymbol} onSymbolChange={setSelectedSymbol} />
            <Box mb={0} p={2}>
              <AccountInfoWidget />
            </Box>
            <SimpleGrid columns={{ base: 1, lg: 3 }} gap={2} mb={2} p={2}>
              <Box gridColumn={{ lg: "span 2" }}>
                <ChartWidget symbol={selectedSymbol} />
              </Box>
              <Box>
                <OrderForm />
              </Box>
            </SimpleGrid>
            <Box mb={2} p={2}>
              <BacktestPanel />
            </Box>
            <Box p={2}>
              <PositionTable />
            </Box>
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





