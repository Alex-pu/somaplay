import { Suspense, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import type { MutableRefObject } from 'react'
import FollowCamera from './FollowCamera'
import Player from './Player'
import Village from './Village'
import DestinationWorld from './DestinationWorld'
import ForestWorld from './ForestWorld'
import CityWorld from './CityWorld'
import RocketJourney from './RocketJourney'
import { useGameStore } from '../store/gameStore'
import type { GameStage } from '../data/vocabulary'

function Scene({ player, yaw, stage }: {
  player: MutableRefObject<RapierRigidBody | null>
  yaw: MutableRefObject<number>
  stage: GameStage
}) {
  if (stage === 'launch') {
    return <RocketJourney />
  }

  const World = stage === 'village'
    ? Village
    : stage === 'destination'
      ? DestinationWorld
      : stage === 'forest'
        ? ForestWorld
        : CityWorld

  return (
    <>
      <Physics key={stage} gravity={[0, -18, 0]}>
        <World />
        <Player yaw={yaw} bodyRef={player} />
      </Physics>
      <FollowCamera player={player} yaw={yaw} />
    </>
  )
}

export default function GameCanvas() {
  const [loaded, setLoaded] = useState(false)
  const player = useRef<RapierRigidBody | null>(null)
  const yaw = useRef(0)
  const stage = useGameStore((state) => state.stage)
  const worldTitle = stage === 'village'
    ? '🌿 Getting the village ready…'
    : stage === 'destination'
      ? '✨ Star Island is ready!'
      : stage === 'forest'
        ? '🌳 Getting the woodland ready…'
        : stage === 'city'
          ? '🚕 Getting the city ready…'
          : '🚀 Getting ready for the next level…'

  return (
    <div className="scene-wrap">
      {!loaded && <div className="scene-status">{worldTitle}</div>}
      <Canvas
        className="game-canvas"
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 5, 10], fov: 52, near: 0.1, far: 120 }}
        gl={{ antialias: false, powerPreference: 'low-power' }}
        onCreated={() => setLoaded(true)}
        fallback={<div className="scene-status scene-error">This browser could not start the 3D game. Try a recent version of Chrome, Edge, or Firefox.</div>}
      >
        <Suspense fallback={null}>
          <Scene player={player} yaw={yaw} stage={stage} />
        </Suspense>
      </Canvas>
    </div>
  )
}
