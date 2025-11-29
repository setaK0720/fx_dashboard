import { ChakraProvider, SimpleGrid, Box, Text } from '@chakra-ui/react'
import { system } from './theme'
import { DashboardLayout } from './components/Layout/DashboardLayout'
import { RatePanel } from './features/dashboard/RatePanel'
import { ChartWidget } from './features/dashboard/ChartWidget'
import { PositionTable } from './features/dashboard/PositionTable'
import { OrderForm } from './features/dashboard/OrderForm'

import { AccountPanel } from './features/account/AccountPanel'
import { AccountInfoWidget } from './features/dashboard/AccountInfoWidget'
import { HistoryPanel } from './features/dashboard/HistoryPanel'
import { DataManagementPanel } from './features/data/DataManagementPanel'
import { AnalysisPanel } from './features/analysis/AnalysisPanel'
import { SandboxPanel } from './features/sandbox/SandboxPanel'
import { AccountAnalysisPanel } from './features/analysis/AccountAnalysisPanel'
import { BacktestPanel } from './features/backtest/BacktestPanel'
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
            <Box mb={6}>
              <AccountInfoWidget />
            </Box>
            <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6} mb={6}>
              <Box gridColumn={{ lg: "span 2" }}>
                <ChartWidget symbol={selectedSymbol} />
              </Box>
              <Box>
                <OrderForm />
              </Box>
            </SimpleGrid>

            <PositionTable />
          </>
        ) : currentView === 'history' ? (
          <HistoryPanel />
        ) : currentView === 'data' ? (
          <DataManagementPanel />
        ) : currentView === 'analysis' ? (
          <AnalysisPanel />
        ) : currentView === 'sandbox' ? (
          <SandboxPanel />
        ) : currentView === 'account-analysis' ? (
          <AccountAnalysisPanel />
        ) : currentView === 'backtest' ? (
          <BacktestPanel />
        ) : (
          <AccountPanel />
        )}
      </DashboardLayout>
      <Toaster />
    </ChakraProvider>
  )
}

export default App
