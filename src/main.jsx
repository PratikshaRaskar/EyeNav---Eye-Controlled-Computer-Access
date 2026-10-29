import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { TrackerProvider } from './context/Tracker.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <TrackerProvider>
        <App />
      </TrackerProvider>
    </HashRouter>
  </React.StrictMode>
)
