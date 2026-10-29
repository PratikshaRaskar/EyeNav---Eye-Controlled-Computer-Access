import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import Nav from './components/Nav'
import { useTracker } from './context/Tracker'
import Home from './pages/Home'
import Demo from './pages/Demo'
import Calibration from './pages/Calibration'
import Dashboard from './pages/Dashboard'
import Features from './pages/Features'
import About from './pages/About'

export default function App() {
  const { settings } = useTracker()
  const { pathname } = useLocation()
  useEffect(() => { scrollTo(0, 0) }, [pathname])
  return (
    <MotionConfig reducedMotion={settings.reduceMotion ? 'always' : 'user'}>
      <a href="#main" className="sr-only z-50 rounded bg-white p-2 text-black focus:not-sr-only focus:fixed focus:left-2 focus:top-2">Skip to content</a>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/calibration" element={<Calibration />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/features" element={<Features />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <footer className="border-t border-white/10 py-8 text-center text-xs text-slate-500">
        NeuroVerse · Team Neuroverse Innovators · Open Innovation track · Hackathon prototype
      </footer>
    </MotionConfig>
  )
}
