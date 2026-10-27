import { RigidBody, CuboidCollider } from '@react-three/rapier'
import LearningObject from './LearningObject'
import VillageCharacter from './VillageCharacter'
import { vocabulary } from '../data/vocabulary'
import WorldBoundary from './WorldBoundary'

function Rock({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <CuboidCollider args={[0.48 * scale, 0.35 * scale, 0.48 * scale]} />
      <mesh castShadow receiveShadow position={[0, 0, 0]} scale={scale} rotation={[0.2, 0.4, -0.15]}>
        <dodecahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial color="#9b9b83" flatShading />
      </mesh>
    </RigidBody>
  )
}

function GrassTuft({ x, z, color }: { x: number; z: number; color: string }) {
  return (
    <group position={[x, 0.04, z]}>
      <mesh rotation={[0, 0, -0.2]}>
        <coneGeometry args={[0.12, 0.45, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh rotation={[0.1, 1, 0.2]}>
        <coneGeometry args={[0.1, 0.38, 4]} />
        <meshStandardMaterial color="#75aa55" />
      </mesh>
    </group>
  )
}

export default function Village() {
  return (
    <>
      <color attach="background" args={['#a9dff1']} />
      <fog attach="fog" args={['#b9e7e9', 32, 78]} />
      <ambientLight intensity={0.65} />
      <directionalLight
        position={[-12, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color="#8fbd70" />
      </mesh>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[80, 0.2, 80]} position={[0, -0.22, 0]} />
      </RigidBody>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <ringGeometry args={[3.2, 6.1, 48]} />
        <meshStandardMaterial color="#c68d60" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, 0]}>
        <circleGeometry args={[3.2, 40]} />
        <meshStandardMaterial color="#8fbd70" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, -6.5]} receiveShadow>
        <planeGeometry args={[3.2, 8]} />
        <meshStandardMaterial color="#c68d60" />
      </mesh>
      {vocabulary.map((item) => <LearningObject key={item.id} item={item} />)}
      <WorldBoundary />
      <VillageCharacter model="character-female-a" position={[2.5, 0, 1.5]} rotation={-0.7} />
      <VillageCharacter model="character-female-b" position={[-2, 0, 10]} rotation={Math.PI} />
      <VillageCharacter model="character-male-b" position={[-10, 0, -1]} rotation={0.8} />
      {[
        [-12, -3, 1], [11, -5, 1.2], [12, 9, 0.8], [-11, 10, 0.9], [3, -15, 1.1],
        [-3, 13, 0.7], [14, 1, 1], [-14, 5, 1.2], [9, -13, 0.8], [-9, -12, 0.8],
      ].map(([x, z, scale], index) => (
        <Rock key={index} position={[x, 0.35, z]} scale={scale} />
      ))}
      {Array.from({ length: 34 }, (_, index) => {
        const x = ((index * 17) % 29) - 14
        const z = ((index * 23) % 31) - 15
        return <GrassTuft key={index} x={x} z={z} color={index % 2 ? '#5c9b52' : '#79ad5b'} />
      })}
    </>
  )
}
