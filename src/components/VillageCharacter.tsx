import { useEffect, useMemo, useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import { Box3, Group, Mesh, Vector3 } from 'three'
import { clone } from 'three/addons/utils/SkeletonUtils.js'

interface VillageCharacterProps {
  model: string
  position: [number, number, number]
  rotation?: number
}

export default function VillageCharacter({ model, position, rotation = 0 }: VillageCharacterProps) {
  const root = useRef<Group>(null)
  const path = `/models/kenney/characters/${model}.glb`
  const { scene, animations } = useGLTF(path)
  const character = useMemo(() => {
    const copy = clone(scene) as Group
    const bounds = new Box3().setFromObject(copy)
    const height = bounds.getSize(new Vector3()).y
    const scale = height > 0 ? 1.5 / height : 1
    copy.scale.setScalar(scale)
    copy.position.y = -bounds.min.y * scale
    copy.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = true
        object.receiveShadow = true
      }
    })
    return copy
  }, [scene])
  const { actions } = useAnimations(animations, root)

  useEffect(() => {
    const idle = actions.idle
    idle?.reset().fadeIn(0.2).play()
    return () => { idle?.fadeOut(0.15) }
  }, [actions])

  return (
    <group ref={root} position={position} rotation={[0, rotation, 0]}>
      <primitive object={character} />
    </group>
  )
}

useGLTF.preload('/models/kenney/characters/character-female-a.glb')
useGLTF.preload('/models/kenney/characters/character-female-b.glb')
useGLTF.preload('/models/kenney/characters/character-male-b.glb')
