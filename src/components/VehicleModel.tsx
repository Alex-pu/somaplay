import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3, Group, Mesh, Vector3 } from 'three'
import { clone } from 'three/addons/utils/SkeletonUtils.js'

export default function VehicleModel() {
  const { scene } = useGLTF('/models/kenney/cars/taxi.glb')
  const model = useMemo(() => {
    const copy = clone(scene) as Group
    const bounds = new Box3().setFromObject(copy)
    const size = bounds.getSize(new Vector3())
    const footprint = Math.max(size.x, size.z)
    const scale = footprint > 0 ? 3.8 / footprint : 1
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

  return <primitive object={model} />
}

useGLTF.preload('/models/kenney/cars/taxi.glb')
