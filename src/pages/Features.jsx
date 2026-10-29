import { motion } from 'framer-motion'
import { Eye, MousePointerClick, ScanFace, Mic, Brain, ShieldCheck } from 'lucide-react'
import { Page, Glass, Badge } from '../components/ui'

const F = [
  [Eye, 'Eye Tracking', 'working', 'Iris landmarks from MediaPipe plus a 9-point calibration move an on-screen cursor. Accuracy depends on lighting and head stability; it is not comparable to dedicated eye trackers.'],
  [MousePointerClick, 'Blink to Click', 'working', 'A deliberate long blink clicks, left wink clicks, right wink right-clicks. Dwell-to-click is available too. Durations are adjustable.'],
  [ScanFace, 'Face Gestures', 'working', 'Mouth open scrolls down; eyebrow raise scrolls up, read from MediaPipe blendshape scores.'],
  [Mic, 'Voice Commands', 'prototype', 'Small fixed command set (click, scroll, navigate) via the Web Speech API. Chrome/Edge only; no dictation or "open browser" yet.'],
  [Brain, 'AI Personalization', 'prototype', 'Per-user calibration fits a regression model and you can tune thresholds. Continuous adaptive learning and a gesture classifier are planned, not built.'],
  [ShieldCheck, 'Privacy-First Processing', 'prototype', 'Video frames are processed in your browser and never uploaded by this app. The face model downloads once from Google/jsDelivr, and Chrome\'s speech recognition may send audio to a cloud service when voice is on.'],
]

export default function Features() {
  return (
    <Page kicker="Features" title="What works today" intro="Each card is labelled honestly: working in this build, prototype, or planned.">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {F.map(([I, t, k, d], n) => (
          <motion.div key={t} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: n * 0.05 }}>
            <Glass className="h-full transition hover:border-sky-400/40">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-500/30 to-violet-500/30"><I className="text-sky-300" size={22} /></span>
              <h2 className="mt-4 font-display text-lg font-semibold text-white">{t}</h2>
              <div className="mt-1"><Badge kind={k} /></div>
              <p className="mt-3 text-sm text-slate-400">{d}</p>
            </Glass>
          </motion.div>
        ))}
      </div>
      <Glass className="mt-8 border-amber-400/30">
        <h2 className="font-display text-lg font-semibold text-white">Current limitation</h2>
        <p className="mt-2 text-sm text-slate-400">A web page cannot move the operating-system cursor or type into other apps. NeuroVerse currently controls only its own pages. System-wide control would need a native companion app (planned in the architecture, not implemented).</p>
      </Glass>
    </Page>
  )
}
