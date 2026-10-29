import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { fitGaze, predictGaze, gazeFeatures } from '../lib/gaze'

const Ctx = createContext(null)
export const useTracker = () => useContext(Ctx)

const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
const MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
const CLICKABLE = 'button,a,[data-gaze-target],input,select,summary'

export const DEFAULTS = {
  sensitivity: 1.0, responsiveness: 0.3, dwellMs: 1400, blinkMs: 450,
  dwell: true, blink: true, wink: true, mouth: true, brow: true, voice: false, showCursor: true,
  reduceMotion: false, highContrast: false, largeText: false,
}
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* storage unavailable */ } }
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

export function TrackerProvider({ children }) {
  const [status, setStatus] = useState('idle') // idle | loading | running | error
  const [error, setError] = useState('')
  const [stream, setStream] = useState(null)
  const [settings, setSettings] = useState(() => ({ ...DEFAULTS, ...load('nv-settings', {}) }))
  const [calib, setCalib] = useState(() => load('nv-calib', null))
  const [metrics, setMetrics] = useState({ face: false, fps: 0, latency: 0, gx: 0, gy: 0, bl: 0, br: 0, jaw: 0, brow: 0, gesture: 'Neutral' })
  const [log, setLog] = useState([])
  const [voice, setVoice] = useState({ supported: true, listening: false, heard: '', error: '' })

  const S = useRef(settings); S.current = settings
  const videoEl = useRef(null)
  const lm = useRef(null)
  const cursorEl = useRef(null)
  const ringEl = useRef(null)
  const stopRef = useRef(() => {})
  const R = useRef({
    raf: 0, lastT: -1, fpsT: [], pub: 0, model: load('nv-calib', null), feat: null,
    cx: innerWidth / 2, cy: innerHeight / 2, ax: 0, ay: 0, at: 0, dwellEl: null,
    eye: null, eyeT: 0, g: 'Neutral',
  })

  const update = useCallback((patch) => setSettings((s) => { const n = { ...s, ...patch }; save('nv-settings', n); return n }), [])
  const addLog = useCallback((msg) => setLog((l) => [{ id: Date.now() + Math.random(), t: new Date().toLocaleTimeString(), msg }, ...l].slice(0, 12)), [])

  const activate = useCallback((el, label, type = 'click') => {
    const r = R.current
    const hit = el || document.elementFromPoint(r.cx, r.cy)
    const name = (hit?.closest?.(CLICKABLE)?.textContent || hit?.tagName || 'nothing').trim().slice(0, 24)
    if (type === 'right') hit?.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: r.cx, clientY: r.cy }))
    else (hit?.closest?.(CLICKABLE) || hit)?.click?.()
    addLog(`${label} → ${name}`)
  }, [addLog])

  const setRing = (p) => ringEl.current?.style.setProperty('--p', p)

  const process = (res, now, dt) => {
    const r = R.current, s = S.current
    r.fpsT.push(now); while (r.fpsT.length && now - r.fpsT[0] > 1000) r.fpsT.shift()
    const L = res.faceLandmarks?.[0], cats = res.faceBlendshapes?.[0]?.categories
    let m = { face: false, bl: 0, br: 0, jaw: 0, brow: 0, gesture: 'No face detected' }
    if (L && cats) {
      const b = {}; for (const c of cats) b[c.categoryName] = c.score
      const bl = b.eyeBlinkLeft, br = b.eyeBlinkRight
      const brow = (b.browInnerUp + (b.browOuterUpLeft + b.browOuterUpRight) / 2) / 2
      const both = bl > 0.55 && br > 0.55, lOnly = bl > 0.6 && br < 0.35, rOnly = br > 0.6 && bl < 0.35
      const open = bl < 0.4 && br < 0.4
      let g = 'Neutral'

      // Gaze → cursor (frozen while eyes are closed: iris is unreliable then)
      if (open) {
        const f = gazeFeatures(L); r.feat = f
        const p = r.model ? predictGaze(r.model, f) : { x: 0.5 - (f[2] - 0.5) * 3, y: 0.5 + (f[3] - 0.5) * 3 }
        const tx = clamp(0.5 + (p.x - 0.5) * s.sensitivity, 0, 1) * innerWidth
        const ty = clamp(0.5 + (p.y - 0.5) * s.sensitivity, 0, 1) * innerHeight
        r.cx += (tx - r.cx) * s.responsiveness; r.cy += (ty - r.cy) * s.responsiveness
        if (cursorEl.current) cursorEl.current.style.transform = `translate(${r.cx}px,${r.cy}px)`
      } else r.feat = null

      // Dwell click
      const el = open && s.dwell ? document.elementFromPoint(r.cx, r.cy)?.closest(CLICKABLE) : null
      if (el && !el.disabled) {
        if (r.dwellEl !== el || Math.hypot(r.cx - r.ax, r.cy - r.ay) > 60) { r.ax = r.cx; r.ay = r.cy; r.dwellEl = el; r.at = now }
        const p = (now - r.at) / s.dwellMs
        setRing(clamp(p, 0, 1))
        if (p >= 1) { activate(el, 'Dwell click'); r.at = now + 900 }
      } else { r.dwellEl = null; setRing(0) }

      // Blink / wink state machine (long deliberate blink avoids natural blinks)
      const kind = both ? 'both' : lOnly ? 'left' : rOnly ? 'right' : null
      if (kind !== r.eye) {
        const d = now - r.eyeT
        if (r.eye === 'both' && s.blink && d >= s.blinkMs && d < 2500) activate(null, 'Long blink click')
        if (r.eye === 'left' && s.wink && d >= 250 && d < 1500) activate(null, 'Left wink click')
        if (r.eye === 'right' && s.wink && d >= 250 && d < 1500) activate(null, 'Right wink right-click', 'right')
        r.eye = kind; r.eyeT = now
      }
      if (kind === 'both') g = 'Eyes closed (blink)'
      else if (kind === 'left') g = 'Left wink'
      else if (kind === 'right') g = 'Right wink'

      // Face gestures → scroll
      if (s.mouth && b.jawOpen > 0.5) { scrollBy(0, 14); g = 'Mouth open → scroll down' }
      else if (s.brow && brow > 0.55) { scrollBy(0, -14); g = 'Brow raise → scroll up' }
      if (g !== r.g && /scroll/.test(g)) addLog(g)
      r.g = g
      m = { face: true, bl, br, jaw: b.jawOpen, brow, gesture: g }
    } else { r.feat = null; setRing(0) }

    if (now - r.pub > 200) {
      r.pub = now
      setMetrics({ ...m, fps: r.fpsT.length, latency: Math.round(dt), gx: Math.round(r.cx), gy: Math.round(r.cy) })
    }
  }

  const start = useCallback(async () => {
    if (status === 'loading' || status === 'running') return
    setStatus('loading'); setError('')
    try {
      const st = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' }, audio: false })
      const v = document.createElement('video'); v.playsInline = true; v.muted = true; v.srcObject = st
      await v.play(); videoEl.current = v; setStream(st)
      if (!lm.current) {
        const fs = await FilesetResolver.forVisionTasks(WASM)
        lm.current = await FaceLandmarker.createFromOptions(fs, {
          baseOptions: { modelAssetPath: MODEL, delegate: 'GPU' },
          runningMode: 'VIDEO', numFaces: 1, outputFaceBlendshapes: true,
        })
      }
      const r = R.current; r.lastT = -1
      const frame = () => {
        r.raf = requestAnimationFrame(frame)
        if (v.readyState < 2 || v.currentTime === r.lastT) return
        r.lastT = v.currentTime
        const t0 = performance.now()
        const res = lm.current.detectForVideo(v, t0)
        process(res, t0, performance.now() - t0)
      }
      frame(); setStatus('running'); addLog('Tracking started')
    } catch (e) {
      setStatus('error')
      setError(e?.name === 'NotAllowedError' ? 'Camera permission was denied. Allow camera access in the browser address bar and try again.' : `Could not start tracking: ${e?.message || e}`)
    }
  }, [status, addLog])

  const stop = useCallback(() => {
    cancelAnimationFrame(R.current.raf)
    setStream((st) => { st?.getTracks().forEach((t) => t.stop()); return null })
    videoEl.current = null; R.current.feat = null; setRing(0)
    setStatus('idle'); addLog('Tracking stopped')
  }, [addLog])
  stopRef.current = stop

  const saveCalibration = useCallback((samples) => {
    const m = fitGaze(samples); R.current.model = m
    const c = { ...m, at: Date.now() }; setCalib(c); save('nv-calib', c); return m
  }, [])
  const clearCalibration = useCallback(() => { R.current.model = null; setCalib(null); save('nv-calib', null) }, [])
  const getFeat = useCallback(() => R.current.feat, [])

  // Voice commands (Web Speech API)
  const runVoice = useRef(() => {})
  runVoice.current = (txt) => {
    const t = txt.toLowerCase()
    if (/right click/.test(t)) activate(null, 'Voice: right click', 'right')
    else if (/\b(click|select)\b/.test(t)) activate(null, 'Voice: click')
    else if (/scroll down/.test(t)) { scrollBy({ top: 400, behavior: 'smooth' }); addLog('Voice: scroll down') }
    else if (/scroll up/.test(t)) { scrollBy({ top: -400, behavior: 'smooth' }); addLog('Voice: scroll up') }
    else if (/stop tracking/.test(t)) stopRef.current()
    else {
      const m = t.match(/(?:go to|open)\s+(home|live demo|demo|calibration|dashboard|features|about)/)
      if (m) { const k = m[1]; location.hash = '#/' + (k === 'home' ? '' : k === 'live demo' ? 'demo' : k); addLog(`Voice: open ${k}`) }
    }
  }
  useEffect(() => {
    if (!settings.voice) { setVoice((v) => ({ ...v, listening: false })); return }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setVoice((v) => ({ ...v, supported: false })); return }
    const rec = new SR(); let on = true
    rec.continuous = true; rec.interimResults = false; rec.lang = 'en-IN'
    rec.onstart = () => setVoice((v) => ({ ...v, listening: true, error: '' }))
    rec.onresult = (e) => { const txt = e.results[e.results.length - 1][0].transcript.trim(); setVoice((v) => ({ ...v, heard: txt })); runVoice.current(txt) }
    rec.onerror = (e) => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') on = false; setVoice((v) => ({ ...v, error: e.error })) }
    rec.onend = () => { setVoice((v) => ({ ...v, listening: false })); if (on) try { rec.start() } catch { /* already started */ } }
    try { rec.start() } catch { /* ignore */ }
    return () => { on = false; rec.stop() }
  }, [settings.voice])

  // Accessibility settings → <html> classes
  useEffect(() => {
    const c = document.documentElement.classList
    c.toggle('reduce-motion', settings.reduceMotion); c.toggle('hc', settings.highContrast); c.toggle('large-text', settings.largeText)
  }, [settings.reduceMotion, settings.highContrast, settings.largeText])

  useEffect(() => () => { cancelAnimationFrame(R.current.raf) }, [])

  const value = { status, error, stream, start, stop, settings, update, calib, saveCalibration, clearCalibration, getFeat, metrics, log, voice }
  return (
    <Ctx.Provider value={value}>
      {children}
      <div ref={cursorEl} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[100]"
        style={{ display: status === 'running' && settings.showCursor ? 'block' : 'none' }}>
        <div ref={ringEl} className="gaze-ring" /><div className="gaze-dot" />
      </div>
    </Ctx.Provider>
  )
}
