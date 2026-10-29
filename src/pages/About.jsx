import { Keyboard, IndianRupee, Users, Heart, Wallet, Accessibility, GraduationCap } from 'lucide-react'
import { Page, Glass } from '../components/ui'

const problems = [[Keyboard, 'Input barrier', 'Mouse and keyboard assume two fully working hands.'], [IndianRupee, 'Hardware barrier', 'Specialised assistive devices are costly and hard to get.'], [Users, 'Independence barrier', 'Users often need someone else to navigate their PC.']]
const gaps = ['No affordable option that works with just a webcam.', 'Eyes, face and voice are rarely combined in one tool.', 'Little AI personalisation of eye movements and gestures to each user\'s comfort.']
const benefits = [[Accessibility, 'Inclusion', 'Opens education and jobs to more people.'], [Heart, 'Wider reach', 'Also helps with injury, tremor and ageing.'], [Wallet, 'Low cost', 'Runs on a laptop with a built-in webcam.'], [GraduationCap, 'Independence', 'Navigate, learn and work without help.']]
const team = ['Bule Sakshi Sambhaji', 'Chavan Shreya Navnath', 'Raskar Pratiksha Santosh']

export default function About() {
  return (
    <Page kicker="About & Impact" title="Why NeuroVerse" intro="People with hand or upper-limb disabilities struggle with computers because most systems depend on a mouse and keyboard, and alternatives need special, costly hardware.">
      <h2 className="font-display text-2xl font-semibold text-white">Problem</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">{problems.map(([I, t, d]) => <Glass key={t}><I className="text-violet-300" /><h3 className="mt-3 font-semibold text-white">{t}</h3><p className="mt-1 text-sm text-slate-400">{d}</p></Glass>)}</div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Glass><h2 className="font-display text-xl font-semibold text-white">The gap</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-400">{gaps.map((g) => <li key={g}>{g}</li>)}</ul></Glass>
        <Glass><h2 className="font-display text-xl font-semibold text-white">Proposed solution</h2><p className="mt-3 text-sm text-slate-400">A webcam-only system that turns eye movement and facial gestures into computer control, with optional voice commands. Gaze steers the cursor, blinks and winks click, mouth and brow moves scroll, and a calibration layer tunes controls to each user.</p></Glass>
      </div>
      <h2 className="mt-10 font-display text-2xl font-semibold text-white">Benefits</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{benefits.map(([I, t, d]) => <Glass key={t}><I className="text-sky-300" /><h3 className="mt-3 font-semibold text-white">{t}</h3><p className="mt-1 text-sm text-slate-400">{d}</p></Glass>)}</div>
      <h2 className="mt-10 font-display text-2xl font-semibold text-white">Team Neuroverse Innovators</h2>
      <p className="mt-1 text-sm text-slate-400">Open Innovation track · Marathwada Mitra Mandal's Institute of Technology</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">{team.map((n) => <Glass key={n} className="text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 font-display text-xl font-bold text-white" aria-hidden="true">{n.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div><p className="mt-3 font-medium text-white">{n}</p></Glass>)}</div>
    </Page>
  )
}
