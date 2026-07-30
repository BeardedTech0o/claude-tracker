import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ThemeProvider from './theme/ThemeProvider'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import '@fontsource/jetbrains-mono/400.css'
import './theme/tokens.css'
import './theme/wall.css'
import './theme/dashboard.css'
import './theme/settings.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
)
