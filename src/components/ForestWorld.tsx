import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { forestVocabulary } from '../data/vocabulary'
import LearningObject from './LearningObject'
import WorldBoundary from './WorldBoundary'

function PineTree({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh castShadow position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.22, 0.32, 1.6, 6]} />
        <meshStandardMaterial color="#79583c" />
      </mesh>
      {[1.4, 2.15, 2.8].map((height, index) => (
        <mesh castShadow key={height} position={[0, height, 0]}>
          <coneGeometry args={[1.15 - index * 0.18, 1.5, 7]} />
          <meshStandardMaterial color={index % 2 ? '#57945a' : '#477e4c'} flatShading />
        </mesh>
      ))}
    </group>
  )
}

export default function ForestWorld() {
  return (
    <>
      <color attach="background" args={['#b9dfb2']} />
      <fog attach="fog" args={['#cde4b8', 32, 78]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[-10, 20, 8]} intensity={1.35} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color="#8fb979" />
      </mesh>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[80, 0.2, 80]} position={[0, -0.22, 0]} />
      </RigidBody>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]}>
        <ringGeometry args={[2.8, 4.4, 40]} />
        <meshStandardMaterial color="#d4b77c" />
      </mesh>
      <WorldBoundary color="#745c43" />
      {forestVocabulary.map((item) => <LearningObject key={item.id} item={item} />)}
      {[
        [-12, -9, 1.1], [-13, 1, 0.9], [-12, 12, 1.15], [-7, -15, 0.9],
        [12, -12, 1.1], [13, -2, 0.95], [12, 12, 1.2], [7, 15, 0.9],
        [-15, -5, 0.75], [15, 7, 0.8],
      ].map(([x, z, scale], index) => (
        <PineTree key={index} x={x} z={z} scale={scale} />
      ))}
      {Array.from({ length: 10 }, (_, index) => (
        <mesh key={index} position={[-4.5 + index, 0.06, 3.2 + (index % 2) * 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.42, 8]} />
          <meshStandardMaterial color={index % 2 ? '#c1a977' : '#d4bd8a'} />
        </mesh>
      ))}
    </>
  )
}
