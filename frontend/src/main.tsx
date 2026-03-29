import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { RosProvider } from './context/RosContext'
import { SettingsProvider } from './context/SettingsContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <SettingsProvider>
        <RosProvider>
          <App />
        </RosProvider>
      </SettingsProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
