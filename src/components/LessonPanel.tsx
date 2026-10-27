import { useEffect, useState } from 'react'
import { allVocabulary } from '../data/vocabulary'
import { useGameStore } from '../store/gameStore'
import { speakEnglish } from '../utils/speech'

interface SpeechAlternative {
  transcript: string
}
interface SpeechResult {
  readonly 0: SpeechAlternative
  readonly length: number
}
interface SpeechResultList {
  readonly 0: SpeechResult
  readonly length: number
}
interface RecognitionEvent extends Event {
  results: SpeechResultList
}
interface RecognitionErrorEvent extends Event {
  error: string
}
interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: RecognitionEvent) => void) | null
  onerror: ((event: RecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}
interface SpeechWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionLike
  webkitSpeechRecognition?: new () => SpeechRecognitionLike
}

function normalizeWord(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '')
}

export default function LessonPanel() {
  const lessonId = useGameStore((state) => state.lessonId)
  const learned = useGameStore((state) => state.learned)
  const closeLesson = useGameStore((state) => state.closeLesson)
  const completeLesson = useGameStore((state) => state.completeLesson)
  const recordSpeechAttempt = useGameStore((state) => state.recordSpeechAttempt)
  const item = allVocabulary.find((entry) => entry.id === lessonId)
  const [speechMessage, setSpeechMessage] = useState('')
  const [listening, setListening] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [spoken, setSpoken] = useState(false)

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  if (!item) return null
  const alreadyLearned = learned.includes(item.id)

  const speakWord = () => {
    const voiceChoice = speakEnglish(item.english, () => setSpoken(true), () => {
      setSpeechMessage('Audio could not be played here. Try saying the word yourself.')
    })
    if (voiceChoice === 'unavailable') {
      setSpeechMessage(`Audio playback is not available in this browser. Try saying “${item.english}” aloud.`)
      return
    }
    setSpeechMessage(voiceChoice === 'feminine'
      ? 'Listen to the soft voice, then try saying it yourself.'
      : 'Using your device’s available English voice; the voice may vary.')
  }

  const tryPronunciation = () => {
    const speechWindow = window as SpeechWindow
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
    if (!Recognition) {
      setAttempted(true)
      setSpeechMessage('Speech recognition is not available in this browser. You can still practise aloud and continue exploring!')
      return
    }
    const recognition = new Recognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 3
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      const matches = normalizeWord(transcript) === normalizeWord(item.english)
      recordSpeechAttempt(item.id, matches)
      setAttempted(true)
      setSpeechMessage(matches
        ? `We heard “${transcript}” — that sounds like a match! Speech recognition is only an approximate check.`
        : `We heard “${transcript}”. Try “${item.english}” (${item.pronunciation}) once more. Recognition can be imperfect.`)
      setListening(false)
    }
    recognition.onerror = (event) => {
      setListening(false)
      setAttempted(true)
      setSpeechMessage(event.error === 'not-allowed'
        ? 'Microphone access was not allowed. You can practise aloud without it.'
        : event.error === 'no-speech'
          ? 'We did not hear speech that time. Try again or continue exploring.'
          : 'Speech recognition had a problem. You can practise aloud without it.')
    }
    recognition.onend = () => setListening(false)
    try {
      setListening(true)
      setAttempted(false)
      setSpeechMessage('Listening… say the word now.')
      recognition.start()
    } catch {
      setListening(false)
      setSpeechMessage('Could not start speech recognition. You can practise aloud without it.')
    }
  }

  const continueExploring = () => {
    completeLesson(item.id)
    closeLesson()
  }

  return (
    <div className="lesson-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) closeLesson()
    }}>
      <section className="lesson-panel" role="dialog" aria-modal="true" aria-labelledby="lesson-word">
        <button className="close-button" type="button" aria-label="Close lesson" onClick={closeLesson}>×</button>
        <div className="lesson-topline"><span>{item.kind === 'fox' ? 'WOODLAND WORD STOP' : item.kind === 'taxi' ? 'CITY WORD STOP' : ['bunny', 'cat', 'monkey', 'parrot', 'lion'].includes(item.id) ? 'STAR ISLAND WORD STOP' : 'WORD STOP'}</span><span className="lesson-dots"><i /><i /><i /></span></div>
        <div className="lesson-art" aria-hidden="true">
          <div className={`lesson-illustration illustration-${item.kind}`}>
            {item.kind === 'tree' ? '🌳' : item.kind === 'house' ? '🏡' : item.kind === 'cow' ? '🐄' : item.kind === 'dog' ? '🐕' : item.kind === 'elephant' ? '🐘' : item.kind === 'bunny' ? '🐇' : item.kind === 'cat' ? '🐈' : item.kind === 'monkey' ? '🐒' : item.kind === 'parrot' ? '🦜' : item.kind === 'fox' ? '🦊' : item.kind === 'taxi' ? '🚕' : '🦁'}
          </div>
          <span className="art-sparkle sparkle-one">✦</span><span className="art-sparkle sparkle-two">✧</span>
        </div>
        <p className="eyebrow">SAY IT WITH A SMILE</p>
        <h1 id="lesson-word">{item.english}</h1>
        <p className="translation">pronounced <strong>{item.pronunciation}</strong></p>
        <p className="swahili-translation">Swahili: <strong>{item.swahili}</strong></p>
        <p className="lesson-hint">{item.hint}</p>
        <div className="lesson-actions">
          <button className="audio-button" type="button" onClick={speakWord}>
            <span>♫</span> Hear the word
          </button>
          <button className={`mic-button${listening ? ' is-listening' : ''}`} type="button" onClick={tryPronunciation} disabled={listening}>
            <span>{listening ? '◉' : '🎙'}</span> {listening ? 'Listening…' : 'Try saying it'}
          </button>
        </div>
        {speechMessage && (
          <div className={`speech-feedback${attempted ? ' feedback-attempted' : ''}`} role="status">
            <span>{listening ? '👂' : attempted ? '💛' : '✨'}</span>
            <p>{speechMessage}<small>Speech-to-text is an estimate, not a pronunciation score.</small></p>
          </div>
        )}
        {!speechMessage && !spoken && (
          <p className="gentle-nudge">No pressure — have fun practising!</p>
        )}
        {alreadyLearned && <div className="already-learned">✓ You already learned this word — come back any time!</div>}
        <button className="primary-button lesson-continue" type="button" onClick={continueExploring}>
          {alreadyLearned ? 'Keep exploring' : 'Got it, keep exploring'} <span>→</span>
        </button>
        {!alreadyLearned && <small className="reward-note">Complete this word stop to earn 1 star</small>}
      </section>
    </div>
  )
}
