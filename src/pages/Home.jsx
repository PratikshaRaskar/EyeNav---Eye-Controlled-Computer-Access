import { motion } from 'framer-motion'
import { ArrowRight, Play, Eye, ScanFace, Mic, Webcam } from 'lucide-react'
import { LinkBtn, Glass } from '../components/ui'

function EyeVisual() {
  const path = { x: [0, 90, 90, -90, -90, 0], y: [0, -40, 40, 40, -40, 0] }
  const tiles = ['Open', 'Select', 'Next', 'Back']
  return (
    <div className="relative mx-auto w-full max-w-md" role="img" aria-label="Illustration: an eye whose gaze moves a cursor across on-screen buttons">
      <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-blue-600/30 to-violet-600/30 blur-3xl" />
      <Glass className="relative">
        <svg viewBox="0 0 200 90" className="mx-auto w-48">
          <path d="M10 45 Q100 -15 190 45 Q100 105 10 45Z" fill="rgba(56,189,248,.08)" stroke="#38bdf8" strokeWidth="2" />
          <motion.g animate={{ x: [0, 22, 22, -22, -22, 0], y: [0, -8, 8, 8, -8, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
            <circle cx="100" cy="45" r="24" fill="#6366f1" /><circle cx="100" cy="45" r="11" fill="#0a1030" /><circle cx="94" cy="39" r="4" fill="#fff" />
          </motion.g>
        </svg>
        <div className="relative mt-4 grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-navy-900/80 p-4">
          {tiles.map((t, i) => (
            <motion.div key={t} className="rounded-lg border border-white/10 bg-white/5 py-5 text-center text-sm text-slate-300"
              animate={{ borderColor: ['rgba(255,255,255,.1)', '#38bdf8', 'rgba(255,255,255,.1)'], boxShadow: ['0 0 0 rgba(0,0,0,0)', '0 0 22px rgba(56,189,248,.5)', '0 0 0 rgba(0,0,0,0)'] }}
              transition={{ duration: 8 / 4, repeat: Infinity, delay: i * 2, repeatDelay: 6 }}>{t}</motion.div>
          ))}
          <motion.div className="pointer-events-none absolute left-1/2 top-1/2 h-4 w-4 rounded-full bg-white shadow-[0_0_14px_#22d3ee]" animate={path} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
        <p className="mt-3 text-center text-xs text-slate-500">Illustration only — try the real thing in Live Demo</p>
      </Glass>
    </div>
  )
}

export default function Home() {
  const pills = [[Eye, 'Eyes'], [ScanFace, 'Face'], [Mic, 'Voice (optional)'], [Webcam, 'Standard webcam']]
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:px-6">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="mb-4 inline-block rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-300">AI-Assisted Hands-Free Digital Navigation</p>
          <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-6xl">Control Your Digital World, <span className="grad-text">Hands-Free</span></h1>
          <p className="mt-5 max-w-xl text-lg text-slate-400">NeuroVerse turns eye movement, facial gestures and optional voice commands into computer control for people with hand or upper-limb disabilities, using only a standard webcam.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkBtn to="/calibration">Get Started <ArrowRight size={16} /></LinkBtn>
            <LinkBtn to="/demo" variant="ghost"><Play size={16} /> Live Demo</LinkBtn>
          </div>
          <ul className="mt-8 flex flex-wrap gap-2">{pills.map(([I, l]) => <li key={l} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm"><I size={14} className="text-violet-300" />{l}</li>)}</ul>
          <p className="mt-6 max-w-xl text-xs text-slate-500">Prototype scope: controls the NeuroVerse web app in your browser. System-wide OS control is not implemented yet.</p>
        </motion.div>
        <EyeVisual />
      </div>
    </main>
  )
}
