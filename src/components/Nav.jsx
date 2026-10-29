import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X, Eye } from 'lucide-react'
import { useTracker } from '../context/Tracker'

const links = [['/', 'Home'], ['/demo', 'Live Demo'], ['/calibration', 'Calibration'], ['/dashboard', 'Dashboard'], ['/features', 'Features'], ['/about', 'About & Impact']]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const { status } = useTracker()
  const cls = ({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white'}`
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-navy-950/70 backdrop-blur-xl">
      <nav aria-label="Main" className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-white">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500"><Eye size={18} /></span>NeuroVerse
        </Link>
        <div className="hidden items-center gap-1 lg:flex">
          {links.map(([to, l]) => <NavLink key={to} to={to} end={to === '/'} className={cls}>{l}</NavLink>)}
          <span className="ml-3 flex items-center gap-2 text-xs text-slate-400" role="status">
            <span className={`h-2 w-2 rounded-full ${status === 'running' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-500'}`} />{status === 'running' ? 'Tracking' : 'Idle'}
          </span>
        </div>
        <button className="rounded-lg p-2 text-white lg:hidden" aria-expanded={open} aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </nav>
      {open && <div className="flex flex-col gap-1 border-t border-white/10 px-4 py-3 lg:hidden">{links.map(([to, l]) => <NavLink key={to} to={to} end={to === '/'} className={cls} onClick={() => setOpen(false)}>{l}</NavLink>)}</div>}
    </header>
  )
}
