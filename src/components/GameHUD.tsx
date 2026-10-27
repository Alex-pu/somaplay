import { useEffect, useRef, useState } from 'react'
import { allVocabulary, getNextWorldStage, levelVocabulary, stageDetails, type VocabularyId, type WorldStage } from '../data/vocabulary'
import { useGameStore } from '../store/gameStore'
import LearnerProfile from './LearnerProfile'
import { playCollisionClick, speakWordPrompt } from '../utils/speech'

function Joystick() {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const setJoystick = useGameStore((state) => state.setJoystick)
  const active = useRef(false)

  const update = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!active.current) return
    const rect = event.currentTarget.getBoundingClientRect()
    const max = rect.width * 0.34
    const dx = event.clientX - (rect.left + rect.width / 2)
    const dy = event.clientY - (rect.top + rect.height / 2)
    const length = Math.hypot(dx, dy)
    const factor = length > max ? max / length : 1
    const x = (dx * factor) / max
    const y = (dy * factor) / max
    setOffset({ x: x * max, y: y * max })
    setJoystick(x, y)
  }

  const end = () => {
    active.current = false
    setOffset({ x: 0, y: 0 })
    setJoystick(0, 0)
  }

  return (
    <div
      className="joystick"
      role="group"
      aria-label="Movement joystick"
      onPointerDown={(event) => {
        active.current = true
        event.currentTarget.setPointerCapture(event.pointerId)
        update(event)
      }}
      onPointerMove={update}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <span className="joystick-knob" style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }} />
    </div>
  )
}

export default function GameHUD() {
  const [profileOpen, setProfileOpen] = useState(false)
  const [resumePausedAfterProfile, setResumePausedAfterProfile] = useState(false)
  const lastEncounteredId = useRef<VocabularyId | null>(null)
  const stars = useGameStore((state) => state.stars)
  const learned = useGameStore((state) => state.learned)
  const nearbyId = useGameStore((state) => state.nearbyId)
  const paused = useGameStore((state) => state.paused)
  const stage = useGameStore((state) => state.stage)
  const storageWarning = useGameStore((state) => state.storageWarning)
  const setPaused = useGameStore((state) => state.setPaused)
  const setStage = useGameStore((state) => state.setStage)
  const nextStage = stage === 'launch' ? getNextWorldStage(learned) : null
  const activeStage: WorldStage = stage === 'launch'
    ? nextStage === null || nextStage === 'complete' ? 'city' : nextStage
    : stage === 'complete' ? 'city' : stage
  const activeVocabulary = stage === 'launch' || stage === 'complete' ? [] : levelVocabulary[stage]
  const stageInfo = stageDetails[activeStage]
  const openProfile = () => {
    setResumePausedAfterProfile(paused)
    setPaused(true)
    setProfileOpen(true)
  }
  const closeProfile = () => {
    setProfileOpen(false)
    setPaused(resumePausedAfterProfile)
  }
  const levelLearned = activeVocabulary.filter((item) => learned.includes(item.id)).length
  const nextWord = activeVocabulary.find((item) => !learned.includes(item.id))
  const nearby = activeVocabulary.find((item) => item.id === nearbyId)

  useEffect(() => {
    if (!nearbyId) {
      lastEncounteredId.current = null
      return
    }
    if (lastEncounteredId.current === nearbyId) return
    lastEncounteredId.current = nearbyId
    const item = allVocabulary.find((entry) => entry.id === nearbyId)
    if (!item) return
    playCollisionClick()
    speakWordPrompt(item.english)
    const game = useGameStore.getState()
    game.recordWordVisit(item.id)
    game.completeLesson(item.id)
  }, [nearbyId])

  const reset = () => {
    if (window.confirm('Start a fresh adventure? Your profile, practice history, stars, and learned words will be cleared from this device.')) {
      useGameStore.getState().resetProgress()
    }
  }

  if (stage === 'launch') {
    return (
      <div className="launch-overlay" role="status" aria-live="polite">
        <div className="launch-stars" />
        <div className="launch-copy">
          {nextStage === 'complete' ? (
            <>
              <span className="launch-kicker">ADVENTURE COMPLETE</span>
              <h1>You did it!</h1>
              <p>You explored all four worlds and learned every word.</p>
            </>
          ) : (
            <>
              <span className="launch-kicker">LEVEL {stageInfo.level} UNLOCKED</span>
              <h1>Off to {stageInfo.title}!</h1>
              <p>A new word adventure is waiting ahead.</p>
            </>
          )}
        </div>
        <div className="launch-caption"><span className="launch-countdown">3 · 2 · 1</span><span>{nextStage === 'complete' ? 'Celebrating your progress…' : 'Rocket flight in progress…'}</span></div>
      </div>
    )
  }

  if (stage === 'complete') {
    return (
      <>
        <div className="game-complete-overlay" role="status">
          <section className="game-complete-card">
            <div className="game-complete-icon" aria-hidden="true">🎉</div>
            <p className="eyebrow">ALL FOUR LEVELS COMPLETE</p>
            <h1>Wonderful learning!</h1>
            <p>You learned all {allVocabulary.length} words across the village, Star Island, Woodland Trail, and Sunny City.</p>
            <button className="primary-button" type="button" onClick={() => {
              setStage('city')
              setPaused(false)
            }}>Visit Sunny City again <span>→</span></button>
            <button className="text-button" type="button" onClick={openProfile}>View learner profile</button>
          </section>
        </div>
        {profileOpen && <LearnerProfile onClose={closeProfile} />}
      </>
    )
  }

  return (
    <div className="hud">
      <header className="hud-top">
        <div className="brand">
          <span className="brand-mark">S</span>
          <span className="brand-copy"><strong>SomaPlay</strong><small>{stageInfo.label}</small></span>
        </div>
        <div className="score-cluster">
          <div className="score-pill"><span>★</span> {stars} <small>stars</small></div>
          <div className="score-pill score-learned">📖 {learned.length}<small>/{allVocabulary.length} words</small></div>
          <button
            className="icon-button pause-button"
            type="button"
            aria-label={paused ? 'Resume game' : 'Open pause menu'}
            onClick={() => setPaused(!paused)}
          >
            {paused ? '▶' : 'Ⅱ'}
          </button>
          <button className="icon-button profile-button" type="button" aria-label="Open learner profile" onClick={openProfile}>👤</button>
        </div>
      </header>

      <aside className="objective-card">
        <div className="objective-label"><span className="sparkle">✦</span> {stageInfo.label} · LEVEL {stageInfo.level}</div>
        <strong>{nextWord ? `Find the word “${nextWord.english}”` : `You learned every ${stageInfo.title} word!`}</strong>
        <div className="progress-track" aria-label={`${levelLearned} of ${activeVocabulary.length} words learned`}>
          <span style={{ width: `${(levelLearned / activeVocabulary.length) * 100}%` }} />
        </div>
        <small>{levelLearned} of {activeVocabulary.length} words learned · Level {stageInfo.level}</small>
      </aside>

      <div className="controls-card">
        <strong>HOW TO PLAY</strong>
        <span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrows <i>move</i></span>
        <span><kbd>Space</kbd> <i>jump</i></span>
        <span><kbd>E</kbd> <i>hear the word again</i></span>
        <span><i>Drag the screen to look around</i></span>
      </div>

      {nearby && !paused && (
        <button className="interact-prompt" type="button" onClick={() => speakWordPrompt(nearby.english)}>
          <span className="prompt-key">♫</span>
          <span><strong>{nearby.english}</strong><small>Tap or press E to hear again</small></span>
        </button>
      )}

      {storageWarning && <div className="storage-warning" role="status">{storageWarning}</div>}
      <Joystick />

      {paused && !profileOpen && (
        <div className="pause-overlay">
          <section className="pause-card">
            <div className="pause-icon">🌤️</div>
            <p className="eyebrow">TAKE A BREATHER</p>
            <h2>Adventure paused</h2>
            <p>Your village is waiting whenever you’re ready.</p>
            <button className="text-button profile-open-button" type="button" onClick={openProfile}>Open learner profile</button>
            <button className="primary-button" type="button" onClick={() => setPaused(false)}>Back to village <span>→</span></button>
            <button className="text-button" type="button" onClick={reset}>Reset my progress</button>
            <div className="pause-tip"><strong>Little tip</strong> Walk up close to a word, then press <kbd>E</kbd>.</div>
          </section>
        </div>
      )}
      {profileOpen && <LearnerProfile onClose={closeProfile} />}
      {!paused && (
        <div className="village-note"><span>{stage === 'village' ? '☀' : '✦'}</span> {stageInfo.greeting}</div>
      )}
    </div>
  )
}
