import { useEffect, useMemo, useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import { Box3, Group, Mesh, Vector3 } from 'three'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import type { VocabularyKind } from '../data/vocabulary'

const animalModels: Partial<Record<VocabularyKind, { file: string; height: number }>> = {
  cow: { file: 'animal-cow.glb', height: 1.75 },
  dog: { file: 'animal-dog.glb', height: 1.35 },
  elephant: { file: 'animal-elephant.glb', height: 2.2 },
  bunny: { file: 'animal-bunny.glb', height: 1.25 },
  cat: { file: 'animal-cat.glb', height: 1.2 },
  monkey: { file: 'animal-monkey.glb', height: 1.5 },
  parrot: { file: 'animal-parrot.glb', height: 1.3 },
  lion: { file: 'animal-lion.glb', height: 1.7 },
  fox: { file: 'animal-fox.glb', height: 1.45 },
}

export default function AnimalModel({ kind }: { kind: VocabularyKind }) {
  const root = useRef<Group>(null)
  const modelInfo = animalModels[kind]
  const { scene, animations } = useGLTF(`/models/kenney/animals/${modelInfo?.file ?? 'animal-cow.glb'}`)
  const model = useMemo(() => {
    const copy = clone(scene) as Group
    const bounds = new Box3().setFromObject(copy)
    const size = bounds.getSize(new Vector3())
    const scale = size.y > 0 ? (modelInfo?.height ?? 1.5) / size.y : 1
    copy.scale.setScalar(scale)
    copy.position.y = -bounds.min.y * scale
    copy.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = true
        object.receiveShadow = true
      }
    })
    return copy
  }, [scene, modelInfo])
  const { actions } = useAnimations(animations, root)

  useEffect(() => {
    const idle = actions.idle ?? actions.static
    idle?.reset().fadeIn(0.2).play()
    return () => { idle?.fadeOut(0.15) }
  }, [actions])

  return (
    <group ref={root}>
      <primitive object={model} />
    </group>
  )
}

useGLTF.preload('/models/kenney/animals/animal-cow.glb')
useGLTF.preload('/models/kenney/animals/animal-dog.glb')
useGLTF.preload('/models/kenney/animals/animal-elephant.glb')
useGLTF.preload('/models/kenney/animals/animal-fox.glb')
