import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { SwapPage } from './pages/SwapPage'
import { BridgePage } from './pages/BridgePage'
import { PortfolioPage } from './pages/PortfolioPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { AutomationPage } from './pages/AutomationPage'
import { SettingsPage } from './pages/SettingsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="swap" element={<SwapPage />} />
          <Route path="bridge" element={<BridgePage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="automation" element={<AutomationPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ThemeProvider>
  )
}

export default App 