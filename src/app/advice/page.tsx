'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'

const USE_OPENAI = true
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

const CRISIS_TEXT = `Thank you so much for sharing that. It appears that you are asking me something that is beyond my ability to help with. Remember, I am not a therapist or a mental health professional, I'm a behavior coach!

If you are in danger or need immediate help, please call 911 (or call 988 if you are feeling suicidal or are having thoughts about hurting yourself).

If you're looking for someone to help you beyond behavior coaching, you should connect with a licensed therapist.`

/** ──────────────────────────────────────────────────────────────────────────
 * Demo scenarios (unchanged content)
 * ────────────────────────────────────────────────────────────────────────── */
const demoScenarios: Record<string, { title: string; text: string; reflection: string; validation: string; followUp: string; actions: string[] }> = {
  '1': {
    title: 'Evening Loneliness After Conflict',
    text: `Earlier today I argued with my brother over text, and now that it's evening and I'm home alone, I feel the urge to drink to quiet my frustration and loneliness. I skipped dinner and have been scrolling on my phone for the last hour.`,
    reflection: `You’re feeling alone and frustrated after your argument, and you notice the urge to numb out or distract yourself instead of feeling those emotions.`,
    validation: `It makes sense you’d want to withdraw and distract after a fight—anyone would feel unsettled and want relief in that situation.`,
    followUp: `If you didn’t have to wrestle with these feelings tonight, how would you want to spend your evening instead?`,
    actions: [
      '✅ Easiest: Do a brief grounding exercise to reconnect right now.',
      '💚 Values-based: Take a small step toward how you’d like your evening to look.',
      '🛡️ Preventive: Swap scrolling for a short, active, or creative task.',
      '🔄 Alt: Try a quick physical activity or something playful to shift your state.',
      '🎯 Bonus: Practice self-compassion—give yourself care, not criticism.',
    ],
  },
  '2': {
    title: 'Stress at Work with Overwhelm',
    text: `I’m overwhelmed with a big work deadline coming up. I put in extra hours but keep getting distracted and procrastinating. I’m worried I won’t finish and my boss will be disappointed.`,
    reflection: `You’re feeling overloaded and distracted, and it’s tough to focus under pressure right now.`,
    validation: `Given the looming deadline and your worries about disappointing your boss, it’s understandable you’d feel frazzled and stuck.`,
    followUp: `If the overwhelm was turned down a notch, what’s one tiny next step you could take on your project?`,
    actions: [
      '✅ Easiest: Take a 1-minute breathing break to reset.',
      '💚 Values-based: Choose a meaningful task that fits your goals and start with that.',
      '🛡️ Preventive: Use a short focus timer (20–25 min) with a planned break.',
      '🔄 Alt: Change your environment briefly to refresh your attention.',
      '🎯 Bonus: Remember a time you finished a tough project—what helped then?',
    ],
  },
  '3': {
    title: 'Anxiety Before Social Event',
    text: `I’m anxious about going to a social event tonight. I worry I won’t know what to say or that people will judge me, and I’m tempted to cancel or avoid it.`,
    reflection: `You’re feeling nervous and uncertain, and avoiding the event seems safer than risking discomfort or judgment.`,
    validation: `It’s normal to worry about being judged in social situations—your reaction is completely understandable.`,
    followUp: `If you felt even a little more at ease, how would you want to show up at the event?`,
    actions: [
      '✅ Easiest: Try a calming breath before you go in.',
      '💚 Values-based: Remind yourself why connecting matters to you.',
      '🛡️ Preventive: Prepare a couple of conversation starters to lean on.',
      '🔄 Alt: Arrive a little early so you can settle in before it’s busy.',
      '🎯 Bonus: Recall a positive social memory to boost your confidence.',
    ],
  },
  '4': {
    title: 'Difficulty Sleeping Due to Worry',
    text: `I can’t sleep because my mind races with worries about my family and finances. I lie awake for hours and feel exhausted the next day.`,
    reflection: `Your mind is busy and restless, making it hard to settle down for sleep.`,
    validation: `It’s natural for stress to disrupt rest—there’s nothing wrong with you for having a noisy brain at night.`,
    followUp: `If your evenings felt a bit calmer, what would your ideal wind-down routine look like?`,
    actions: [
      '✅ Easiest: Do a short body scan or guided relaxation before bed.',
      '💚 Values-based: Choose one small ritual to signal “off-duty” to your brain.',
      '🛡️ Preventive: Power down screens 30–60 minutes before sleep.',
      '🔄 Alt: Jot down worries in a quick “brain dump” earlier in the evening.',
      '🎯 Bonus: Stick to a consistent sleep/wake schedule for a week.',
    ],
  },
  '5': {
    title: 'Feeling Unmotivated to Exercise',
    text: `I haven’t felt motivated to exercise lately. Even though I know it helps, I keep putting it off and making excuses. I feel guilty but can’t seem to get going.`,
    reflection: `You’re feeling stuck between wanting the benefits of movement and not having motivation show up.`,
    validation: `Motivation naturally comes and goes—it’s understandable to stall when you’re tired or stretched thin.`,
    followUp: `If you felt just a bit more energized, what kind of movement would genuinely fit today?`,
    actions: [
      '✅ Easiest: Start tiny—2 minutes of stretching or a short walk.',
      '💚 Values-based: Name why being active matters and let that guide a step.',
      '🛡️ Preventive: Put movement on your calendar like any other priority.',
      '🔄 Alt: Try a new, low-bar activity to spark interest.',
      '🎯 Bonus: Ask a friend to join you for accountability and fun.',
    ],
  },
  '6': {
    title: 'Struggling with Healthy Eating',
    text: `When I’m stressed or tired, I reach for junk food even though I want to eat better. I feel frustrated with myself for not making healthier choices.`,
    reflection: `You’re craving comfort and convenience, even though you want to care for your body in a different way.`,
    validation: `Turning to familiar foods under stress is human—change takes practice, not perfection.`,
    followUp: `If you felt a little more supported, what’s one small change that would make eating well easier this week?`,
    actions: [
      '✅ Easiest: Keep a healthy snack within reach for the next two days.',
      '💚 Values-based: Connect your eating choices to how you want to feel.',
      '🛡️ Preventive: Plan one or two simple meals ahead to avoid last-minute grabs.',
      '🔄 Alt: Try a new, appealing recipe to make healthy eating enjoyable.',
      '🎯 Bonus: Eat mindfully—pause and notice taste and fullness cues.',
    ],
  },
  '7': {
    title: 'Difficulty Managing Anger',
    text: `Lately, small things set me off and I regret how I react. I want to handle my anger better but don’t know how.`,
    reflection: `You’re feeling flooded by strong emotions, and it’s tough to steer your reactions in the moment.`,
    validation: `When you’re stressed or feel unheard, anger is a natural response—new habits take practice over time.`,
    followUp: `If you could respond even a little more calmly, what would that look like in a real moment this week?`,
    actions: [
      '✅ Easiest: Pause and take three slow breaths at the first sign of anger.',
      '💚 Values-based: Clarify what you want to communicate and how you want to show up.',
      '🛡️ Preventive: Move your body to release tension (walk, stretch, shake out).',
      '🔄 Alt: Channel feelings into journaling or creative outlets before responding.',
      '🎯 Bonus: Get support practicing scripts and regulation tools.',
    ],
  },
  '8': {
    title: 'Feeling Isolated and Disconnected',
    text: `I feel isolated and disconnected. Even when I’m around people, I don’t feel understood or supported, and it’s making me lonely and down.`,
    reflection: `You’re feeling lonely and longing for connection that feels real and meaningful.`,
    validation: `It’s natural to feel down when your need for connection isn’t met—many people struggle with this, and you’re not alone.`,
    followUp: `If you felt a bit more connected, what kinds of relationships or interactions would you want to nurture first?`,
    actions: [
      '✅ Easiest: Text or call someone you trust and share a bit of what’s real for you.',
      '💚 Values-based: Name the qualities you value in relationships and seek them out.',
      '🛡️ Preventive: Join a group or activity that matches your interests this month.',
      '🔄 Alt: Offer yourself active self-compassion as you build new connections.',
      '🎯 Bonus: Consider short-term support to boost social confidence and skills.',
    ],
  },
}

/** ──────────────────────────────────────────────────────────────────────────
 * Helpers + phase machine
 * ────────────────────────────────────────────────────────────────────────── */
function looksCrisis(text: string) {
  const s = text.toLowerCase()
  return ['suicide','suicidal','kill myself','end my life','self harm','self-harm'].some(k => s.includes(k))
}

// simple local fallback if API fails
function buildLocalAdvice(
  input: string,
  demo?: { reflection: string; validation: string; followUp: string }
) {
  const t = (input || '').toLowerCase();
  const isShort = t.length < 60;
  const mentionsUse = /(drink|use|get high|relapse|slip|urge|craving)/i.test(t);
  const mentionsConflict = /(fight|argu(e|ment)|conflict|yell|shout|mad|angry)/i.test(t);

  const reflection = demo?.reflection || (
    mentionsUse
      ? "You’re feeling a strong pull toward relief right now."
      : "You’re dealing with something that’s weighing on you."
  );

  const validation = demo?.validation || (
    mentionsConflict
      ? "After conflict, wanting quick relief is a very human reaction."
      : "Wanting fast relief when you’re stressed is understandable."
  );

  const follow = isShort
    ? (mentionsUse
        ? "What just happened that’s fueling this urge, and what’s your goal—avoid, cut down, or ride it out?"
        : "Tell me a bit more about what’s going on and what you’d like help with right now.")
    : "";

  return `${reflection} ${validation}${follow ? ' ' + follow : ''}`;
}

// PHASES — keep steps separate (never combine)
type Phase = 'NEED_CONTEXT' | 'CLARIFY_GOAL' | 'SUMMARY_PERMISSION' | 'AWAIT_PERMISSION' | 'SUGGEST_OPTIONS'

const goalMentioned = /(abstain|avoid(ing)?|quit|stop|not drink|cut\\s*down|reduce|moderate|stay sober|skip(\\s+it)?)/i
const isAffirmative = (s: string) => /\b(yes|yep|yeah|ok(ay)?|sure|please|sounds good|do it|go ahead)\b/i.test(s)

function inferPhase(
  history: { role: 'user'|'assistant'; text: string; kind?: 'FOLLOWUP'|'ADVICE' }[],
  incoming: string
): Phase {
  const last = history[history.length - 1]
  const msg = (incoming || '').trim()

  if (!history.length) return 'NEED_CONTEXT'

  // If assistant just asked permission, await explicit yes
  if (last?.role === 'assistant' && /would it be ok|would it be okay|is it ok if i|share (a|some) options|offer options|share a few/i.test(last.text)) {
    return isAffirmative(msg) ? 'SUGGEST_OPTIONS' : 'AWAIT_PERMISSION'
  }

  // If assistant last turn was a follow-up/question, keep clarifying until we have goal + some context
  if (last?.role === 'assistant' && (last.kind === 'FOLLOWUP' || /\?\s*$/.test(last.text))) {
    if (msg.length < 120 || !goalMentioned.test(msg)) return 'CLARIFY_GOAL'
    return 'SUMMARY_PERMISSION'
  }

  // First reply after user's opening
  if (last?.role === 'user') {
    if (msg.length < 120 || !goalMentioned.test(msg)) return 'NEED_CONTEXT'
    return 'SUMMARY_PERMISSION'
  }

  return 'NEED_CONTEXT'
}

/** ──────────────────────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────────────────────── */
export default function AdvicePage() {
  type Msg = { role: 'user' | 'assistant'; text: string; kind?: 'FOLLOWUP' | 'ADVICE' }

  const [mode, setMode] = useState<'advice'|'chat'>('advice')
  const [scenarioId, setScenarioId] = useState<string>('')

  const [input, setInput] = useState<string>('')

  const [status, setStatus] = useState<'idle'|'thinking'|'streaming'|'done'>('idle')
  const [responseText, setResponseText] = useState('')
  const isBusy = status === 'thinking' || status === 'streaming'
  const [messages, setMessages] = useState<Msg[]>([])
  const [lastKind, setLastKind] = useState<'FOLLOWUP' | 'ADVICE' | null>(null)

  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [askPlan, setAskPlan] = useState<boolean>(false)
  const [planText, setPlanText] = useState<string>('')

  const [phase, setPhase] = useState<Phase>('NEED_CONTEXT')

  const onPickDemo = (id: string) => {
    setScenarioId(id)
    setInput(demoScenarios[id].text)
    setMessages([])
    setLastKind(null)
    setSelectedAction(null)
    setAskPlan(false)
    setPlanText('')
    setPhase('NEED_CONTEXT')
  }

  const demo = useMemo(() => (scenarioId ? demoScenarios[scenarioId] : null), [scenarioId])
  const showCrisis = looksCrisis(input)

  function cleanActionLabel(a: string) {
    const parts = a.split(':')
    return parts.length > 1 ? parts.slice(1).join(':').trim() : a.trim()
  }

  // detect whether to show buttons (only AFTER permission)
  const canShowButtons = mode === 'advice' && phase === 'SUGGEST_OPTIONS' && !showCrisis

  async function generateAdvice() {
    if (!input.trim()) return

    // add user message
    setMessages(prev => [...prev, { role: 'user', text: input }])
    const localInput = input
    setInput('')

    // nextHistory: what the history will be after this user turn
    const nextHistory = [...messages, { role: 'user' as const, text: localInput }]

    // reset selection/planning
    setSelectedAction(null)
    setAskPlan(false)
    setPlanText('')

    setResponseText('')
    setLastKind(null)
    setStatus('thinking')
    await sleep(350)
    setStatus('streaming')

    // ── decide the next PHASE (use nextHistory)
    const nextPhase = inferPhase(nextHistory, localInput)
    setPhase(nextPhase)


    let detected: 'FOLLOWUP' | 'ADVICE' | null = null
    let assembled = ''

    if (USE_OPENAI) {
      try {
        // historyPayload now uses nextHistory
        const historyPayload = nextHistory.map(m => ({ role: m.role, content: m.text }))
        const res = await fetch('/api/advice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: localInput,
            history: historyPayload,
            scenarioId: scenarioId || null,
            phase: nextPhase,
          }),
        })
        if (!res.ok || !res.body) throw new Error('No stream')
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          setResponseText(prev => prev + chunk)
          assembled += chunk
        }
      } catch (err) {
        // local fallback
        detected = nextPhase === 'SUGGEST_OPTIONS' ? 'ADVICE' : 'FOLLOWUP'
        const paragraph = buildLocalAdvice(localInput, demo || undefined)
        assembled = paragraph
        for (let i = 0; i < paragraph.length; i += 3) {
          setResponseText(prev => prev + paragraph.slice(i, i + 3))
          await sleep(15)
        }
      }
    } else {
      detected = nextPhase === 'SUGGEST_OPTIONS' ? 'ADVICE' : 'FOLLOWUP'
      const paragraph = buildLocalAdvice(localInput, demo || undefined)
      assembled = paragraph
      for (let i = 0; i < paragraph.length; i += 3) {
        setResponseText(prev => prev + paragraph.slice(i, i + 3))
        await sleep(15)
      }
    }

    const finalText = (assembled || responseText).trim()
    if (!detected) {
      detected = nextPhase === 'SUGGEST_OPTIONS' ? 'ADVICE' : 'FOLLOWUP'
    }
    setStatus('done')
    setLastKind(detected)
    setMessages(prev => [...prev, { role: 'assistant', text: finalText, kind: detected || undefined }])
    setResponseText('')
  }

  return (
    <>
      <nav className="bg-gray-100 p-4 mb-6 shadow-sm rounded-lg flex gap-4 sticky top-0 z-50">
        <Link href="/" className="text-blue-600 hover:underline font-semibold">Home</Link>
        <Link href="/learn" className="text-blue-600 hover:underline font-semibold">Learn</Link>
        <Link href="/advice" className="text-blue-600 hover:underline font-semibold">Get Advice</Link>
        <Link href="/crisis" className="text-red-600 hover:underline font-semibold">Crisis Support</Link>
      </nav>

      <main className="min-h-screen p-6 max-w-3xl mx-auto bg-white">
        <h1 className="text-3xl font-bold mb-2">🧭 Get Advice</h1>
        <p className="text-sm text-gray-600 mb-6">
          Paste your scenario or pick a demo. I’ll either ask for a bit more context (in a warm, short paragraph),
          or I’ll give a concise response and then offer options—step by step.
        </p>

        <div className="flex gap-2 mb-4">
          <select
            value={scenarioId}
            onChange={(e) => onPickDemo(e.target.value)}
            disabled={isBusy}
            className="ml-auto px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Use a demo scenario…</option>
            <option value="1">#1 Evening Loneliness After Conflict</option>
            <option value="2">#2 Stress at Work with Overwhelm</option>
            <option value="3">#3 Anxiety Before Social Event</option>
            <option value="4">#4 Difficulty Sleeping Due to Worry</option>
            <option value="5">#5 Feeling Unmotivated to Exercise</option>
            <option value="6">#6 Struggling with Healthy Eating</option>
            <option value="7">#7 Difficulty Managing Anger</option>
            <option value="8">#8 Feeling Isolated and Disconnected</option>
          </select>
        </div>

        {/* Transcript */}
        <div className="space-y-3 mb-4">
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <div className={
                'inline-block max-w-[85%] rounded-lg px-3 py-2 ' +
                (m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900')
              }>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe what’s going on…"
          disabled={isBusy}
          className="w-full h-40 p-3 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <div className="flex gap-2 mt-2 mb-4">
          <button
            onClick={() => { setMode('advice'); generateAdvice() }}
            disabled={isBusy}
            className={`px-3 py-2 rounded-md border ${mode==='advice' ? 'bg-blue-600 text-white' : 'bg-white text-blue-700 border-blue-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
          >Get Advice</button>
          <button
            onClick={() => { setMode('chat'); generateAdvice() }}
            disabled={isBusy}
            className={`px-3 py-2 rounded-md border ${mode==='chat' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800 border-gray-800'} disabled:opacity-50 disabled:cursor-not-allowed`}
          >Just Chat</button>
        </div>

        {looksCrisis(input) ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg whitespace-pre-wrap">
            {CRISIS_TEXT}
          </div>
        ) : null}

        {(status === 'thinking' || status === 'streaming') && (
          <div className="mb-4 text-left">
            <div className="inline-block max-w-[85%] rounded-lg px-3 py-2 bg-gray-100 text-gray-900">
              {status === 'thinking' ? 'Thinking…' : <>{responseText}{status === 'streaming' ? '▌' : ''}</>}
            </div>
          </div>
        )}

        {/* Show action buttons ONLY after permission (phase === SUGGEST_OPTIONS) */}
        {canShowButtons && status === 'done' && demo?.actions?.length ? (
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {demo.actions.map((a, idx) => (
              <button
                key={idx}
                onClick={() => { setSelectedAction(a); setAskPlan(true) }}
                className="text-left px-3 py-2 rounded-md border bg-green-50 hover:bg-green-100"
              >
                {cleanActionLabel(a)}
              </button>
            ))}
          </div>
        ) : null}

        {/* Plan helper after picking an action */}
        {askPlan && selectedAction ? (
          <div className="mt-4 p-3 border rounded-lg bg-white">
            <p className="mb-2 font-medium">Plan this action?</p>
            <p className="text-sm text-gray-700 mb-3">You chose: <span className="font-semibold">{cleanActionLabel(selectedAction)}</span>. Do you want help planning how to implement it?</p>
            <div className="flex gap-2 mb-3">
              <button onClick={() => setAskPlan(false)} className="px-3 py-2 border rounded-md">No thanks</button>
              <button onClick={() => setAskPlan(true)} className="px-3 py-2 border rounded-md bg-blue-600 text-white">Yes, help me plan</button>
            </div>
            <div className="space-y-2">
              <input
                className="w-full border rounded-md px-3 py-2"
                placeholder="First small step"
                value={planText}
                onChange={(e) => setPlanText(e.target.value)}
              />
              <div className="text-right">
                <button
                  onClick={() => {
                    const text = `Great — let’s make it doable. First step: ${planText || '⟨define a first step⟩'}. When will you do it, and what might get in the way?`
                    setMessages(prev => [...prev, { role: 'assistant', text }])
                    setAskPlan(false)
                    setSelectedAction(null)
                    setPlanText('')
                  }}
                  className="px-3 py-2 rounded-md bg-blue-600 text-white"
                >
                  Add to chat
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </>
  )
}