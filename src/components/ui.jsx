import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export const Glass = ({ className = '', children, ...p }) => <div className={`glass p-6 ${className}`} {...p}>{children}</div>

const tone = { working: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30', prototype: 'bg-amber-400/15 text-amber-300 border-amber-400/30', planned: 'bg-slate-400/15 text-slate-300 border-slate-400/30' }
export const Badge = ({ kind = 'working', children }) => (
  <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${tone[kind]}`}>{children || kind[0].toUpperCase() + kind.slice(1)}</span>
)

export const LinkBtn = ({ to, variant = 'primary', children }) => <Link to={to} className={variant === 'primary' ? 'btn-primary' : 'btn-ghost'}>{children}</Link>

export const Page = ({ title, kicker, intro, children }) => (
  <motion.main id="main" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6">
    <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">{kicker}</p>
    <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-5xl">{title}</h1>
    {intro && <p className="mt-3 max-w-3xl text-slate-400">{intro}</p>}
    <div className="mt-10">{children}</div>
  </motion.main>
)

export const Toggle = ({ label, hint, checked, onChange }) => (
  <label className="flex cursor-pointer items-center justify-between gap-4 py-2">
    <span><span className="block text-sm font-medium text-slate-100">{label}</span>{hint && <span className="block text-xs text-slate-400">{hint}</span>}</span>
    <input type="checkbox" role="switch" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-white/15 transition peer-checked:bg-blue-500 peer-focus-visible:ring-2 peer-focus-visible:ring-sky-400 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
  </label>
)

export const Slider = ({ label, value, min, max, step, onChange, fmt = (v) => v }) => (
  <label className="block py-2">
    <span className="flex justify-between text-sm"><span className="font-medium text-slate-100">{label}</span><span className="text-sky-300">{fmt(value)}</span></span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full accent-blue-500" />
  </label>
)

export const Bar = ({ label, v }) => (
  <div className="py-1">
    <div className="flex justify-between text-xs text-slate-400"><span>{label}</span><span>{(v * 100).toFixed(0)}%</span></div>
    <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-500 transition-[width] duration-150" style={{ width: `${Math.min(100, v * 100)}%` }} /></div>
  </div>
)
