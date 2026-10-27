import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { cityVocabulary } from '../data/vocabulary'
import LearningObject from './LearningObject'
import WorldBoundary from './WorldBoundary'

function Building({ x, z, width, height, color }: {
  x: number
  z: number
  width: number
  height: number
  color: string
}) {
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow receiveShadow position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, 3.2]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      {Array.from({ length: Math.floor(height / 1.25) }, (_, row) =>
        [-1, 0, 1].map((column) => (
          <mesh key={`${row}-${column}`} position={[column * (width / 4), 1 + row * 1.25, 1.62]}>
            <boxGeometry args={[0.55, 0.62, 0.06]} />
            <meshStandardMaterial color="#b9e6df" emissive="#80bdb1" emissiveIntensity={0.12} />
          </mesh>
        )),
      )}
    </group>
  )
}

export default function CityWorld() {
  return (
    <>
      <color attach="background" args={['#b8dff0']} />
      <fog attach="fog" args={['#c8e3e7', 36, 82]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[-10, 21, 8]} intensity={1.4} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color="#d9cfb8" />
      </mesh>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[80, 0.2, 80]} position={[0, -0.22, 0]} />
      </RigidBody>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
        <planeGeometry args={[5.5, 37]} />
        <meshStandardMaterial color="#70777a" />
      </mesh>
      {Array.from({ length: 10 }, (_, index) => (
        <mesh key={index} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 16 - index * 3.5]}>
          <planeGeometry args={[0.18, 1.7]} />
          <meshBasicMaterial color="#f4dc8c" />
        </mesh>
      ))}
      <WorldBoundary color="#789594" />
      {cityVocabulary.map((item) => <LearningObject key={item.id} item={item} />)}
      <Building x={-8} z={-11} width={5} height={8} color="#e99472" />
      <Building x={8} z={-12} width={5} height={10} color="#7ab6b0" />
      <Building x={-8} z={1} width={5} height={6} color="#edc574" />
      <Building x={8} z={2} width={5} height={7} color="#9b9dca" />
      <Building x={-8} z={14} width={5} height={8} color="#e9a1a0" />
      <Building x={8} z={14} width={5} height={6} color="#8dbb86" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.2, 0.024, -7]}>
        <planeGeometry args={[3, 5]} />
        <meshStandardMaterial color="#9aab77" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.2, 0.024, -7]}>
        <planeGeometry args={[3, 5]} />
        <meshStandardMaterial color="#9aab77" />
      </mesh>
    </>
  )
}
