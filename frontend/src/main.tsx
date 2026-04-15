import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// StrictMode is intentionally removed — it double-mounts components in dev
// which conflicts with browser camera/MediaStream APIs (two video feeds).
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
