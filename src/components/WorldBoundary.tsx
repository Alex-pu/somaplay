import { CuboidCollider, RigidBody } from '@react-three/rapier'

const EDGE = 18
const SPACING = 3
const postPositions = Array.from({ length: 13 }, (_, index) => -EDGE + index * SPACING)

function FenceSide({ x = 0, z = 0, horizontal, color }: {
  x?: number
  z?: number
  horizontal: boolean
  color: string
}) {
  return (
    <group position={[x, 0, z]}>
      {postPositions.map((offset) => (
        <mesh
          key={offset}
          castShadow
          position={horizontal ? [offset, 0.9, 0] : [0, 0.9, offset]}
        >
          <cylinderGeometry args={[0.13, 0.17, 1.8, 6]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
      ))}
      {[0.45, 1.25].map((height) => (
        <mesh
          key={height}
          castShadow
          position={[0, height, 0]}
          rotation={horizontal ? [0, 0, 0] : [0, Math.PI / 2, 0]}
        >
          <boxGeometry args={[EDGE * 2, 0.13, 0.15]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      {Array.from({ length: 12 }, (_, index) => (
        <mesh
          key={index}
          position={horizontal ? [-EDGE + SPACING * index + SPACING / 2, 0.85, 0] : [0, 0.85, -EDGE + SPACING * index + SPACING / 2]}
          rotation={horizontal ? [0, 0, -0.75] : [0.75, 0, 0]}
        >
          <boxGeometry args={[0.1, 1.05, 0.12]} />
          <meshStandardMaterial color="#f5dc9c" />
        </mesh>
      ))}
    </group>
  )
}

export default function WorldBoundary({ color = '#80543c' }: { color?: string }) {
  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[EDGE, 1.2, 0.3]} position={[0, 1.1, -EDGE]} />
        <CuboidCollider args={[EDGE, 1.2, 0.3]} position={[0, 1.1, EDGE]} />
        <CuboidCollider args={[0.3, 1.2, EDGE]} position={[-EDGE, 1.1, 0]} />
        <CuboidCollider args={[0.3, 1.2, EDGE]} position={[EDGE, 1.1, 0]} />
      </RigidBody>
      <FenceSide horizontal z={-EDGE} color={color} />
      <FenceSide horizontal z={EDGE} color={color} />
      <FenceSide x={-EDGE} horizontal={false} color={color} />
      <FenceSide x={EDGE} horizontal={false} color={color} />
    </>
  )
}
