import { RigidBody, CuboidCollider } from '@react-three/rapier'
import WorldBoundary from './WorldBoundary'
import LearningObject from './LearningObject'
import { starVocabulary } from '../data/vocabulary'

function Crystal({ position, color, scale = 1 }: {
  position: [number, number, number]
  color: string
  scale?: number
}) {
  return (
    <mesh castShadow position={position} scale={scale}>
      <octahedronGeometry args={[0.7, 0]} />
      <meshStandardMaterial color={color} flatShading roughness={0.32} metalness={0.12} />
    </mesh>
  )
}

function Stargate({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[-1.4, 1.7, 0]}>
        <cylinderGeometry args={[0.22, 0.29, 3.4, 7]} />
        <meshStandardMaterial color="#ee9b62" flatShading />
      </mesh>
      <mesh castShadow position={[1.4, 1.7, 0]}>
        <cylinderGeometry args={[0.22, 0.29, 3.4, 7]} />
        <meshStandardMaterial color="#ee9b62" flatShading />
      </mesh>
      <mesh castShadow position={[0, 3.3, 0]}>
        <boxGeometry args={[3.1, 0.4, 0.5]} />
        <meshStandardMaterial color="#ffd17b" flatShading />
      </mesh>
      <mesh position={[0, 1.72, 0.02]}>
        <planeGeometry args={[2.5, 2.8]} />
        <meshBasicMaterial color="#c7b9ff" transparent opacity={0.43} side={2} />
      </mesh>
      <mesh castShadow position={[0, 3.65, 0]}>
        <octahedronGeometry args={[0.48, 0]} />
        <meshStandardMaterial color="#bdefff" emissive="#71bddd" emissiveIntensity={0.7} flatShading />
      </mesh>
    </group>
  )
}

export default function DestinationWorld() {
  return (
    <>
      <color attach="background" args={['#b8a9ee']} />
      <fog attach="fog" args={['#d7c4ef', 38, 82]} />
      <ambientLight intensity={0.85} />
      <directionalLight
        position={[-8, 23, 9]}
        intensity={1.55}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color="#a7a1d5" />
      </mesh>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[80, 0.2, 80]} position={[0, -0.22, 0]} />
      </RigidBody>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]}>
        <ringGeometry args={[3, 5.5, 48]} />
        <meshStandardMaterial color="#80d2c2" />
      </mesh>
      <WorldBoundary color="#856b93" />
      <Stargate position={[0, 0, -15]} />
      {starVocabulary.map((item) => <LearningObject key={item.id} item={item} />)}
      <group position={[0, 0.03, 0]}>
        <mesh castShadow position={[0, 0.1, -2.1]}>
          <cylinderGeometry args={[2.3, 2.7, 0.25, 9]} />
          <meshStandardMaterial color="#7e7bb3" flatShading />
        </mesh>
        <mesh castShadow position={[0, 0.28, -2.1]}>
          <cylinderGeometry args={[1.25, 1.55, 0.16, 9]} />
          <meshStandardMaterial color="#f4d37d" flatShading />
        </mesh>
      </group>
      <Crystal position={[-11, 0.75, -1]} color="#8e8bd6" scale={1.2} />
      <Crystal position={[-12, 0.55, 10]} color="#f2a6ce" />
      <Crystal position={[12, 0.7, -1]} color="#ef9b87" scale={1.2} />
      <Crystal position={[11, 0.6, 11]} color="#8e8bd6" />
      <Crystal position={[-12, 0.65, -12]} color="#e98c72" scale={0.9} />
      <Crystal position={[12, 0.75, -12]} color="#7fc7c5" scale={1.2} />
      <Crystal position={[-4, 0.7, 11]} color="#ed83a5" scale={0.8} />
      <Crystal position={[4, 0.75, 11]} color="#edcf72" scale={0.85} />
      <mesh position={[0, 19, -23]}>
        <sphereGeometry args={[3.1, 20, 16]} />
        <meshStandardMaterial color="#fff0b0" emissive="#efc457" emissiveIntensity={0.45} />
      </mesh>
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2
        const x = Math.sin(angle) * 15
        const z = Math.cos(angle) * 15
        return (
          <mesh key={index} position={[x, 0.08, z]} rotation={[0, -angle, 0]}>
            <dodecahedronGeometry args={[0.34, 0]} />
            <meshStandardMaterial color={index % 2 ? '#f2d9a0' : '#f8e5bd'} flatShading />
          </mesh>
        )
      })}
    </>
  )
}
