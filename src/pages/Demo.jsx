import { useEffect, useRef, useState } from 'react'
import { Play, Square, Mic, Camera, Loader2, AlertTriangle } from 'lucide-react'
import { Page, Glass, Toggle, Bar, Badge } from '../components/ui'
import { useTracker } from '../context/Tracker'

const TARGETS = ['Open', 'Select', 'Next', 'Back', 'Menu', 'Confirm']
const COMMANDS = ['"click" / "select"', '"right click"', '"scroll down" / "scroll up"', '"go to dashboard" (or home, demo, calibration, features, about)', '"stop tracking"']

export default function Demo() {
  const t = useTracker()
  const vref = useRef(null)
  const [counts, setCounts] = useState({})
  const [y, setY] = useState(0)
  const hit = (k) => setCounts((c) => ({ ...c, [k]: (c[k] || 0) + 1 }))
  const { status, settings, update, metrics: m, voice } = t

  useEffect(() => { if (vref.current) vref.current.srcObject = t.stream || null }, [t.stream])
  useEffect(() => { const f = () => setY(Math.round(scrollY)); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f) }, [])

  return (
    <Page kicker="Live Demo" title="Try hands-free control" intro="Start tracking, then steer the cursor with your gaze. Dwell on a button, blink for ~0.5 s, or wink to click. Everything below responds to real webcam input.">
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <Glass className="p-3">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-navy-900">
              <video ref={vref} autoPlay muted playsInline className="h-full w-full -scale-x-100 object-cover" aria-label="Webcam preview (mirrored)" />
              {status !== 'running' && <div className="absolute inset-0 grid place-items-center text-center text-slate-400">
                {status === 'loading' ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Loading camera & face model…</span> : <span className="flex flex-col items-center gap-2"><Camera /> Camera is off</span>}
              </div>}
              {status === 'running' && <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs ${m.face ? 'bg-emerald-500/80' : 'bg-red-500/80'} text-white`}>{m.face ? 'Face detected' : 'No face detected'}</span>}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 p-1">
              <button className="btn-primary" onClick={t.start} disabled={status === 'loading' || status === 'running'}><Play size={16} /> Start</button>
              <button className="btn-ghost" onClick={t.stop} disabled={status !== 'running'}><Square size={16} /> Stop</button>
              <span className="text-sm text-slate-400" role="status">Gesture: <b className="text-sky-300">{status === 'running' ? m.gesture : '—'}</b></span>
            </div>
            {status === 'error' && <p role="alert" className="mt-2 flex items-start gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-300"><AlertTriangle size={16} className="mt-0.5 shrink-0" />{t.error}</p>}
            {!t.calib && status === 'running' && <p className="mt-2 text-xs text-amber-300">Not calibrated: the cursor follows head position only. Run Calibration for gaze tracking.</p>}
          </Glass>

          <Glass>
            <h2 className="font-display text-lg font-semibold text-white">Practice targets</h2>
            <p className="text-sm text-slate-400">Real buttons — dwell, blink or wink on them. Right-click target uses a right wink or "right click".</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {TARGETS.map((k) => <button key={k} onClick={() => hit(k)} className="rounded-xl border border-white/15 bg-white/5 py-8 text-lg font-medium text-white transition hover:border-sky-400 hover:bg-sky-400/10">{k}<span className="mt-1 block text-xs text-slate-400">clicked {counts[k] || 0}×</span></button>)}
              <div data-gaze-target tabIndex={0} onContextMenu={(e) => { e.preventDefault(); hit('right') }} className="col-span-2 rounded-xl border border-dashed border-violet-400/50 bg-violet-400/5 py-8 text-center text-lg font-medium text-white sm:col-span-3">Right-click zone<span className="mt-1 block text-xs text-slate-400">right-clicked {counts.right || 0}×</span></div>
            </div>
          </Glass>

          <Glass>
            <h2 className="font-display text-lg font-semibold text-white">Scroll practice <span className="ml-2 text-sm font-normal text-slate-400">page scroll: {y}px</span></h2>
            <p className="text-sm text-slate-400">Open your mouth to scroll down, raise your eyebrows to scroll up.</p>
            <div className="mt-4 h-[900px] rounded-xl bg-gradient-to-b from-blue-500/20 via-violet-500/20 to-fuchsia-500/20 p-4 text-sm text-slate-300">↓ keep scrolling … you reached the end of the practice zone at the bottom ↓</div>
          </Glass>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Glass>
            <h2 className="font-display text-lg font-semibold text-white">Live signals</h2>
            <Bar label="Left eye closed" v={m.bl} /><Bar label="Right eye closed" v={m.br} /><Bar label="Mouth open" v={m.jaw} /><Bar label="Brow raise" v={m.brow} />
            <p className="mt-3 text-xs text-slate-400">Gaze cursor: {m.gx}, {m.gy} px · {m.fps} FPS</p>
          </Glass>
          <Glass>
            <h2 className="font-display text-lg font-semibold text-white">Controls</h2>
            <Toggle label="Dwell to click" hint="Hold gaze on a button" checked={settings.dwell} onChange={(v) => update({ dwell: v })} />
            <Toggle label="Long blink = click" hint={`Both eyes closed ≥ ${settings.blinkMs} ms`} checked={settings.blink} onChange={(v) => update({ blink: v })} />
            <Toggle label="Wink clicks" hint="Left = click, right = right-click" checked={settings.wink} onChange={(v) => update({ wink: v })} />
            <Toggle label="Mouth open → scroll down" checked={settings.mouth} onChange={(v) => update({ mouth: v })} />
            <Toggle label="Brow raise → scroll up" checked={settings.brow} onChange={(v) => update({ brow: v })} />
            <Toggle label="Show gaze cursor" checked={settings.showCursor} onChange={(v) => update({ showCursor: v })} />
          </Glass>
          <Glass>
            <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-display text-lg font-semibold text-white"><Mic size={18} /> Voice commands</h2><Badge kind="prototype">Chrome / Edge</Badge></div>
            <Toggle label="Listen for commands" hint="Uses the browser's speech service" checked={settings.voice} onChange={(v) => update({ voice: v })} />
            {!voice.supported && <p role="alert" className="text-sm text-amber-300">Speech recognition isn't supported in this browser. Use Chrome or Edge.</p>}
            {voice.error && <p role="alert" className="text-sm text-red-300">Voice error: {voice.error}</p>}
            {settings.voice && <p className="text-sm" role="status"><span className={voice.listening ? 'text-emerald-300' : 'text-slate-400'}>{voice.listening ? '● Listening' : '○ Not listening'}</span> · Heard: <i className="text-slate-300">{voice.heard || '—'}</i></p>}
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-400">{COMMANDS.map((c) => <li key={c}>{c}</li>)}</ul>
          </Glass>
          <Glass>
            <h2 className="font-display text-lg font-semibold text-white">Action log</h2>
            <ul className="mt-2 space-y-1 text-xs text-slate-300" aria-live="polite">{t.log.length ? t.log.map((l) => <li key={l.id}><span className="text-slate-500">{l.t}</span> {l.msg}</li>) : <li className="text-slate-500">No actions yet.</li>}</ul>
          </Glass>
        </div>
      </div>
    </Page>
  )
}
