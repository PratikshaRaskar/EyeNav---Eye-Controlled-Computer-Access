import { Activity, Gauge, ScanFace, MousePointer2 } from 'lucide-react'
import { Page, Glass, Toggle, Bar, Badge, LinkBtn } from '../components/ui'
import { useTracker } from '../context/Tracker'

const SAMPLE = [['Mon', 'Reading', '18 min', 'Dwell'], ['Tue', 'Browsing', '32 min', 'Blink'], ['Thu', 'Typing practice', '24 min', 'Dwell + voice'], ['Sat', 'Video call', '41 min', 'Wink']]

export default function Dashboard() {
  const { status, metrics: m, calib, settings, update } = useTracker()
  const run = status === 'running'
  const cards = [
    [Activity, 'Tracking', run ? (m.face ? 'Active' : 'No face') : status === 'loading' ? 'Loading' : 'Idle'],
    [ScanFace, 'Selected gesture', run ? m.gesture : '—'],
    [Gauge, 'Performance', run ? `${m.fps} FPS · ${m.latency} ms/frame` : '—'],
    [MousePointer2, 'Calibration', calib ? 'Saved' : 'Not calibrated'],
  ]
  return (
    <Page kicker="Dashboard" title="System status" intro="Live values come from the running tracker. Start it from Live Demo or Calibration.">
      {!run && <div className="mb-6"><LinkBtn to="/demo">Go to Live Demo</LinkBtn></div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([I, l, v]) => <Glass key={l}><I className="text-sky-400" size={20} /><p className="mt-3 text-xs uppercase tracking-wider text-slate-400">{l}</p><p className="mt-1 font-display text-lg font-semibold text-white">{v}</p></Glass>)}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Glass>
          <h2 className="font-display text-lg font-semibold text-white">Face signals</h2>
          <Bar label="Left eye closed" v={m.bl} /><Bar label="Right eye closed" v={m.br} /><Bar label="Mouth open" v={m.jaw} /><Bar label="Brow raise" v={m.brow} />
          <p className="mt-3 text-sm text-slate-400">Gaze cursor position: {run ? `${m.gx}, ${m.gy}` : '—'}</p>
        </Glass>
        <Glass>
          <h2 className="font-display text-lg font-semibold text-white">Accessibility settings</h2>
          <Toggle label="High contrast" hint="Darker panels, stronger borders" checked={settings.highContrast} onChange={(v) => update({ highContrast: v })} />
          <Toggle label="Larger text" hint="Scales interface text by ~18%" checked={settings.largeText} onChange={(v) => update({ largeText: v })} />
          <Toggle label="Reduce motion" hint="Turns off animations" checked={settings.reduceMotion} onChange={(v) => update({ reduceMotion: v })} />
          <Toggle label="Show gaze cursor" checked={settings.showCursor} onChange={(v) => update({ showCursor: v })} />
        </Glass>
      </div>
      <Glass className="mt-6 overflow-x-auto">
        <div className="flex items-center justify-between"><h2 className="font-display text-lg font-semibold text-white">Session history</h2><Badge kind="planned">Sample data — sessions are not recorded yet</Badge></div>
        <table className="mt-3 w-full text-left text-sm"><thead className="text-slate-400"><tr><th className="py-2">Day</th><th>Activity</th><th>Duration</th><th>Main control</th></tr></thead>
          <tbody>{SAMPLE.map((r) => <tr key={r[0]} className="border-t border-white/10">{r.map((c, i) => <td key={i} className="py-2">{c}</td>)}</tr>)}</tbody></table>
      </Glass>
    </Page>
  )
}
