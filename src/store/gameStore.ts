import { create } from 'zustand'
import {
  allVocabulary,
  getNextWorldStage,
  levelVocabulary,
  type GameStage,
  type VocabularyId,
  type WorldStage,
} from '../data/vocabulary'

const PROGRESS_KEY = 'somaplay-progress'

interface SavedProgress {
  learned: VocabularyId[]
  stars: number
  profile: LearnerProfile
  wordProgress: Partial<Record<VocabularyId, WordProgress>>
}

export interface LearnerProfile {
  name: string
  age: string
  therapyGoal: string
  notes: string
}

export interface WordProgress {
  visits: number
  speechAttempts: number
  speechMatches: number
  lastPracticedAt: string | null
}

interface GameState extends SavedProgress {
  stage: GameStage
  nearbyId: VocabularyId | null
  lessonId: VocabularyId | null
  paused: boolean
  joystick: { x: number; y: number }
  storageWarning: string | null
  setNearby: (id: VocabularyId | null) => void
  openLesson: (id: VocabularyId) => void
  recordWordVisit: (id: VocabularyId) => void
  closeLesson: () => void
  completeLesson: (id: VocabularyId) => void
  recordSpeechAttempt: (id: VocabularyId, matched: boolean) => void
  updateProfile: (profile: LearnerProfile) => void
  setStage: (stage: GameStage) => void
  setPaused: (paused: boolean) => void
  setJoystick: (x: number, y: number) => void
  resetProgress: () => void
}

const emptyProfile: LearnerProfile = { name: '', age: '', therapyGoal: '', notes: '' }

function emptyWordProgress(): WordProgress {
  return { visits: 0, speechAttempts: 0, speechMatches: 0, lastPracticedAt: null }
}

function readProgress(): SavedProgress {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY)
    if (!stored) return { learned: [], stars: 0, profile: emptyProfile, wordProgress: {} }
    const parsed: unknown = JSON.parse(stored)
    if (typeof parsed !== 'object' || parsed === null) return { learned: [], stars: 0, profile: emptyProfile, wordProgress: {} }
    const record = parsed as Record<string, unknown>
    const validIds = allVocabulary.map((item) => item.id)
    const learned = Array.isArray(record.learned)
      ? record.learned.filter((id): id is VocabularyId => validIds.includes(id as VocabularyId))
      : []
    const savedProfile = typeof record.profile === 'object' && record.profile !== null
      ? record.profile as Record<string, unknown>
      : {}
    const profile: LearnerProfile = {
      name: typeof savedProfile.name === 'string' ? savedProfile.name : '',
      age: typeof savedProfile.age === 'string' ? savedProfile.age : '',
      therapyGoal: typeof savedProfile.therapyGoal === 'string' ? savedProfile.therapyGoal : '',
      notes: typeof savedProfile.notes === 'string' ? savedProfile.notes : '',
    }
    const savedWordProgress = typeof record.wordProgress === 'object' && record.wordProgress !== null
      ? record.wordProgress as Record<string, unknown>
      : {}
    const wordProgress: Partial<Record<VocabularyId, WordProgress>> = {}
    for (const id of validIds) {
      const savedWord = savedWordProgress[id]
      if (typeof savedWord !== 'object' || savedWord === null) continue
      const word = savedWord as Record<string, unknown>
      const speechAttempts = Number.isInteger(word.speechAttempts) && Number(word.speechAttempts) >= 0
        ? Number(word.speechAttempts)
        : 0
      const speechMatches = Number.isInteger(word.speechMatches) && Number(word.speechMatches) >= 0
        ? Math.min(Number(word.speechMatches), speechAttempts)
        : 0
      wordProgress[id] = {
        visits: Number.isInteger(word.visits) && Number(word.visits) >= 0 ? Number(word.visits) : 0,
        speechAttempts,
        speechMatches,
        lastPracticedAt: typeof word.lastPracticedAt === 'string' ? word.lastPracticedAt : null,
      }
    }
    return {
      learned,
      stars: Number.isInteger(record.stars) && Number(record.stars) >= 0 ? Number(record.stars) : 0,
      profile,
      wordProgress,
    }
  } catch {
    return { learned: [], stars: 0, profile: emptyProfile, wordProgress: {} }
  }
}

function saveProgress(progress: SavedProgress, setWarning: (warning: string | null) => void) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
    setWarning(null)
  } catch {
    setWarning('Progress could not be saved on this device.')
  }
}

const initialProgress = readProgress()

export const useGameStore = create<GameState>((set, get) => ({
  ...initialProgress,
  stage: getNextWorldStage(initialProgress.learned),
  nearbyId: null,
  lessonId: null,
  paused: false,
  joystick: { x: 0, y: 0 },
  storageWarning: null,
  setNearby: (nearbyId) => {
    if (get().nearbyId !== nearbyId) set({ nearbyId })
  },
  openLesson: (lessonId) => {
    const state = get()
    const wordProgress = {
      ...state.wordProgress,
      [lessonId]: {
        ...(state.wordProgress[lessonId] ?? emptyWordProgress()),
        visits: (state.wordProgress[lessonId]?.visits ?? 0) + 1,
        lastPracticedAt: new Date().toISOString(),
      },
    }
    set({ lessonId, wordProgress })
    saveProgress({ learned: state.learned, stars: state.stars, profile: state.profile, wordProgress }, (storageWarning) => set({ storageWarning }))
  },
  recordWordVisit: (id) => {
    const state = get()
    const previous = state.wordProgress[id] ?? emptyWordProgress()
    const wordProgress = {
      ...state.wordProgress,
      [id]: {
        ...previous,
        visits: previous.visits + 1,
        lastPracticedAt: new Date().toISOString(),
      },
    }
    set({ wordProgress })
    saveProgress({ learned: state.learned, stars: state.stars, profile: state.profile, wordProgress }, (storageWarning) => set({ storageWarning }))
  },
  closeLesson: () => set({ lessonId: null }),
  completeLesson: (id) => {
    const state = get()
    const learned = state.learned.includes(id) ? state.learned : [...state.learned, id]
    const stars = state.stars + (state.learned.includes(id) ? 0 : 1)
    const activeStage: WorldStage | null = state.stage === 'launch' || state.stage === 'complete' ? null : state.stage
    const finishedStage = activeStage
      && levelVocabulary[activeStage].every((item) => learned.includes(item.id))
    const wordProgress = { ...state.wordProgress, [id]: state.wordProgress[id] ?? emptyWordProgress() }
    set({ learned, stars, wordProgress, stage: finishedStage ? 'launch' : state.stage })
    saveProgress({ learned, stars, profile: state.profile, wordProgress }, (storageWarning) => set({ storageWarning }))
  },
  recordSpeechAttempt: (id, matched) => {
    const state = get()
    const previous = state.wordProgress[id] ?? emptyWordProgress()
    const wordProgress = {
      ...state.wordProgress,
      [id]: {
        ...previous,
        speechAttempts: previous.speechAttempts + 1,
        speechMatches: previous.speechMatches + (matched ? 1 : 0),
      },
    }
    set({ wordProgress })
    saveProgress({ learned: state.learned, stars: state.stars, profile: state.profile, wordProgress }, (storageWarning) => set({ storageWarning }))
  },
  updateProfile: (profile) => {
    const state = get()
    set({ profile })
    saveProgress({ learned: state.learned, stars: state.stars, profile, wordProgress: state.wordProgress }, (storageWarning) => set({ storageWarning }))
  },
  setStage: (stage) => set({ stage }),
  setPaused: (paused) => set({ paused }),
  setJoystick: (x, y) => set({ joystick: { x, y } }),
  resetProgress: () => {
    set({
      learned: [],
      stars: 0,
      profile: emptyProfile,
      wordProgress: {},
      stage: 'village',
      nearbyId: null,
      lessonId: null,
      paused: false,
      storageWarning: null,
    })
    try {
      localStorage.removeItem(PROGRESS_KEY)
    } catch {
      set({ storageWarning: 'Progress could not be removed from this device.' })
    }
  },
}))
