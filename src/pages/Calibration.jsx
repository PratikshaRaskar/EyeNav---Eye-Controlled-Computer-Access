import { useEffect, useRef, useState } from 'react'
import { Crosshair, Play, RotateCcw, X } from 'lucide-react'
import { Page, Glass, Slider, Badge } from '../components/ui'
import { useTracker } from '../context/Tracker'

const POINTS = [[.08, .1], [.5, .1], [.92, .1], [.08, .5], [.5, .5], [.92, .5], [.08, .9], [.5, .9], [.92, .9]]

export default function Calibration() {
  const t = useTracker()
  const [phase, setPhase] = useState('idle') // idle | run | done | fail
  const [i, setI] = useState(0)
  const [prog, setProg] = useState(0)
  const [err, setErr] = useState('')
  const samples = useRef([])

  const begin = () => { samples.current = []; setI(0); setErr(''); setPhase('run') }

  useEffect(() => {
    if (phase !== 'run') return
    const buf = []; setProg(0); let iv
    const to = setTimeout(() => {
      iv = setInterval(() => {
        const f = t.getFeat(); if (f) buf.push(f)
        setProg(Math.min(1, buf.length / 20))
        if (buf.length >= 20) {
          clearInterval(iv)
          samples.current.push({ f: buf[0].map((_, k) => buf.reduce((a, b) => a + b[k], 0) / buf.length), x: POINTS[i][0], y: POINTS[i][1] })
          if (i < POINTS.length - 1) setI(i + 1)
          else { try { t.saveCalibration(samples.current); setPhase('done') } catch (e) { setErr(e.message); setPhase('fail') } }
        }
      }, 50)
    }, 900)
    return () => { clearTimeout(to); clearInterval(iv) }
  }, [phase, i])

  useEffect(() => {
    if (phase !== 'run') return
    const esc = (e) => e.key === 'Escape' && setPhase('idle')
    addEventListener('keydown', esc); return () => removeEventListener('keydown', esc)
  }, [phase])

  const { settings, update, calib, status } = t
  const [px, py] = POINTS[i]

  return (
    <Page kicker="Calibration" title="Teach NeuroVerse how you look" intro="Look at each of 9 targets while keeping your head fairly still. A small regression model maps your eye position to screen position.">
      <div className="grid gap-6 lg:grid-cols-2">
        <Glass>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-white"><Crosshair size={18} /> Calibration wizard</h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-400">
            <li>Sit about 50–70 cm from the screen with your face well lit.</li><li>Start tracking.</li><li>Follow each glowing dot with your eyes until it moves. Press Esc to cancel.</li>
          </ol>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="btn-ghost" onClick={t.start} disabled={status === 'running' || status === 'loading'}>1 · Start tracking</button>
            <button className="btn-primary" onClick={begin} disabled={status !== 'running'}><Play size={16} /> 2 · Begin calibration</button>
          </div>
          {status === 'error' && <p role="alert" className="mt-3 text-sm text-red-300">{t.error}</p>}
          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm" role="status">
            {calib ? <>Calibrated {new Date(calib.at).toLocaleString()} · fit error ≈ {(calib.err * 100).toFixed(1)}% of screen on the 9 targets <Badge kind="prototype">Training error, not tested accuracy</Badge></> : 'No calibration saved. Gaze falls back to head position.'}
          </div>
          {phase === 'done' && <p className="mt-3 text-sm text-emerald-300" role="status">Calibration saved. Open Live Demo to test it.</p>}
          {phase === 'fail' && <p className="mt-3 text-sm text-red-300" role="alert">{err} Try again with better lighting.</p>}
          <button className="btn-ghost mt-4" onClick={t.clearCalibration} disabled={!calib}><RotateCcw size={16} /> Reset calibration</button>
        </Glass>

        <Glass>
          <h2 className="font-display text-lg font-semibold text-white">Sensitivity settings</h2>
          <Slider label="Cursor range" value={settings.sensitivity} min={0.6} max={2} step={0.05} fmt={(v) => `${v.toFixed(2)}×`} onChange={(v) => update({ sensitivity: v })} />
          <Slider label="Responsiveness (low = smoother)" value={settings.responsiveness} min={0.05} max={0.8} step={0.05} fmt={(v) => v.toFixed(2)} onChange={(v) => update({ responsiveness: v })} />
          <Slider label="Dwell time" value={settings.dwellMs} min={600} max={3000} step={100} fmt={(v) => `${(v / 1000).toFixed(1)} s`} onChange={(v) => update({ dwellMs: v })} />
          <Slider label="Blink-to-click duration" value={settings.blinkMs} min={250} max={1000} step={50} fmt={(v) => `${v} ms`} onChange={(v) => update({ blinkMs: v })} />
          <p className="mt-3 text-xs text-slate-500">Settings save automatically in this browser and apply live.</p>
        </Glass>
      </div>

      {phase === 'run' && (
        <div className="fixed inset-0 z-50 bg-navy-950/95" role="dialog" aria-modal="true" aria-label="Calibration targets">
          <p className="absolute inset-x-0 top-6 text-center text-slate-300" role="status">Target {i + 1} of {POINTS.length} — look at the dot{!t.metrics.face && <span className="text-red-300"> · no face detected</span>}</p>
          <button className="btn-ghost absolute right-4 top-4" onClick={() => setPhase('idle')}><X size={16} /> Cancel</button>
          <div className="absolute" style={{ left: `${px * 100}%`, top: `${py * 100}%`, transform: 'translate(-50%,-50%)' }}>
            <span className="absolute -inset-4 animate-ping rounded-full bg-sky-400/40" />
            <span className="relative block h-6 w-6 rounded-full bg-white shadow-[0_0_30px_#38bdf8]" style={{ boxShadow: `0 0 0 ${prog * 10}px rgba(139,92,246,.6), 0 0 30px #38bdf8` }} />
          </div>
        </div>
      )}
    </Page>
  )
}
