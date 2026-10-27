import { lazy, Suspense, useEffect } from 'react'
import GameHUD from './components/GameHUD'
import { allVocabulary, getNextWorldStage } from './data/vocabulary'
import { useGameStore } from './store/gameStore'
import { speakWordPrompt } from './utils/speech'
import './App.css'

const GameCanvas = lazy(() => import('./components/GameCanvas'))

function App() {
  const nearbyId = useGameStore((state) => state.nearbyId)
  const paused = useGameStore((state) => state.paused)
  const stage = useGameStore((state) => state.stage)
  const setPaused = useGameStore((state) => state.setPaused)
  const setStage = useGameStore((state) => state.setStage)

  useEffect(() => {
    if (stage !== 'launch') return
    const timeout = window.setTimeout(() => {
      setStage(getNextWorldStage(useGameStore.getState().learned))
    }, 5500)
    return () => window.clearTimeout(timeout)
  }, [stage, setStage])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.code === 'KeyE' && nearbyId && !paused && stage !== 'launch') {
        const item = allVocabulary.find((entry) => entry.id === nearbyId)
        if (item) speakWordPrompt(item.english)
      }
      if (event.code === 'Escape') {
        if (stage !== 'launch') setPaused(!useGameStore.getState().paused)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [nearbyId, paused, stage, setPaused])

  return (
    <main className="game-shell">
      <Suspense fallback={<div className="scene-status" role="status">Getting the world ready…</div>}>
        <GameCanvas />
      </Suspense>
      <GameHUD />
    </main>
  )
}

export default App
