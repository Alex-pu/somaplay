import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CapsuleCollider, RigidBody } from '@react-three/rapier'
import { useAnimations, useGLTF } from '@react-three/drei'
import type { RapierRigidBody } from '@react-three/rapier'
import type { MutableRefObject } from 'react'
import { Box3, Group, Mesh, Vector3 } from 'three'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import { useGameStore } from '../store/gameStore'
import { levelVocabulary, type VocabularyItem } from '../data/vocabulary'

export default function Player({
  yaw,
  bodyRef,
}: {
  yaw: MutableRefObject<number>
  bodyRef: MutableRefObject<RapierRigidBody | null>
}) {
  const animationRoot = useRef<Group>(null)
  const currentAnimation = useRef<string | null>(null)
  const keys = useRef(new Set<string>())
  const { scene, animations } = useGLTF('/models/kenney/characters/character-male-a.glb')
  const model = useMemo(() => {
    const character = clone(scene) as Group
    const bounds = new Box3().setFromObject(character)
    const height = bounds.getSize(new Vector3()).y
    const scale = height > 0 ? 1.5 / height : 1
    character.scale.setScalar(scale)
    character.position.y = -bounds.min.y * scale
    character.traverse((object) => {
      if (object instanceof Mesh) object.castShadow = true
    })
    return character
  }, [scene])
  const { actions } = useAnimations(animations, animationRoot)

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) event.preventDefault()
      keys.current.add(event.code)
    }
    const up = (event: KeyboardEvent) => keys.current.delete(event.code)
    const clear = () => keys.current.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', clear)
    }
  }, [])

  useEffect(() => {
    const idle = actions.idle
    if (!idle) return
    idle.reset().fadeIn(0.2).play()
    currentAnimation.current = 'idle'
    return () => { idle.fadeOut(0.15) }
  }, [actions])

  useFrame(() => {
    const player = bodyRef.current
    if (!player) return
    const state = useGameStore.getState()
    const activeVocabulary = state.stage === 'launch' || state.stage === 'complete' ? [] : levelVocabulary[state.stage]
    const { x: jx, y: jy } = state.joystick
    const inputX = (keys.current.has('KeyD') || keys.current.has('ArrowRight') ? 1 : 0)
      - (keys.current.has('KeyA') || keys.current.has('ArrowLeft') ? 1 : 0) + jx
    const inputY = (keys.current.has('KeyW') || keys.current.has('ArrowUp') ? 1 : 0)
      - (keys.current.has('KeyS') || keys.current.has('ArrowDown') ? 1 : 0) - jy
    const length = Math.hypot(inputX, inputY)
    const factor = length > 1 ? 1 / length : 1
    const localX = inputX * factor
    const localForward = inputY * factor
    const speed = 5
    const vx = (Math.sin(yaw.current) * localForward + Math.cos(yaw.current) * localX) * speed
    const vz = (-Math.cos(yaw.current) * localForward + Math.sin(yaw.current) * localX) * speed
    const velocity = player.linvel()
    const stopped = state.paused || state.stage === 'complete' || Boolean(state.lessonId)
    player.setLinvel({ x: stopped ? 0 : vx, y: velocity.y, z: stopped ? 0 : vz }, true)

    const nextAnimation = !stopped && length > 0.08 ? 'walk' : 'idle'
    if (currentAnimation.current !== nextAnimation && actions[nextAnimation]) {
      actions[currentAnimation.current ?? 'idle']?.fadeOut(0.15)
      actions[nextAnimation]?.reset().fadeIn(0.15).play()
      currentAnimation.current = nextAnimation
    }

    if (!stopped && keys.current.has('Space') && player.translation().y < 1.18) {
      player.setLinvel({ x: velocity.x, y: 6.2, z: velocity.z }, true)
      keys.current.delete('Space')
    }
    const position = player.translation()
    let nearest: VocabularyItem | null = null
    let nearestDistance = 2.8
    for (const item of activeVocabulary) {
      const dx = position.x - item.position[0]
      const dz = position.z - item.position[2]
      const distance = Math.hypot(dx, dz)
      if (distance < nearestDistance) {
        nearest = item
        nearestDistance = distance
      }
    }
    state.setNearby(nearest?.id ?? null)
    if (animationRoot.current && length > 0.08 && !stopped) {
      animationRoot.current.rotation.y = Math.atan2(vx, vz)
    }
  })

  return (
    <RigidBody
      ref={bodyRef}
      colliders={false}
      position={[0, 1.1, 5]}
      enabledRotations={[false, false, false]}
      linearDamping={4}
      angularDamping={4}
      friction={1}
      mass={1}
      ccd
    >
      <CapsuleCollider args={[0.42, 0.38]} />
      <group ref={animationRoot} position={[0, -0.75, 0]}>
        <primitive object={model} />
      </group>
    </RigidBody>
  )
}

export type PlayerBodyRef = MutableRefObject<RapierRigidBody | null>

useGLTF.preload('/models/kenney/characters/character-male-a.glb')
