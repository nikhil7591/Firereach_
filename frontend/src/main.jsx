import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './AppRouter.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LoadingScreen />
    <AppRouter />
  </StrictMode>,
)
