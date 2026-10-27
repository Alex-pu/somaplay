import { useMemo, useRef } from 'react'
import { Sparkles, Stars } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { Group, Mesh, Vector3 } from 'three'

function Rocket() {
  const rocket = useRef<Group>(null)
  const exhaustOuter = useRef<Mesh>(null)
  const exhaustInner = useRef<Mesh>(null)
  const elapsed = useRef(0)

  useFrame((_, delta) => {
    elapsed.current += delta
    const time = elapsed.current
    const progress = Math.min(time / 5.5, 1)
    if (rocket.current) {
      const launch = Math.max(0, progress - 0.08)
      rocket.current.position.set(
        Math.sin(time * 5) * (1 - progress) * 0.16,
        0.3 + launch * launch * 48,
        3 - launch * 18,
      )
      rocket.current.rotation.z = Math.sin(time * 5) * (1 - progress) * 0.025
      rocket.current.scale.setScalar(1 - Math.max(0, progress - 0.64) * 1.7)
    }
    const flicker = 0.82 + Math.sin(time * 22) * 0.13 + Math.sin(time * 37) * 0.05
    if (exhaustOuter.current) exhaustOuter.current.scale.set(1, flicker, 1)
    if (exhaustInner.current) exhaustInner.current.scale.set(1, flicker * 0.86, 1)
  })

  return (
    <group ref={rocket}>
      <mesh castShadow position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.57, 0.57, 2.1, 12]} />
        <meshStandardMaterial color="#fff4d9" roughness={0.43} metalness={0.08} />
      </mesh>
      <mesh castShadow position={[0, 1.28, 0]}>
        <coneGeometry args={[0.57, 0.85, 12]} />
        <meshStandardMaterial color="#ed7555" flatShading />
      </mesh>
      <mesh castShadow position={[0, -0.97, 0]}>
        <cylinderGeometry args={[0.35, 0.48, 0.18, 10]} />
        <meshStandardMaterial color="#bd6955" metalness={0.28} />
      </mesh>
      <mesh castShadow position={[0, 0.15, 0.56]}>
        <circleGeometry args={[0.23, 18]} />
        <meshStandardMaterial color="#93dce9" emissive="#4eabc5" emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0, 0.15, 0.575]}>
        <circleGeometry args={[0.13, 16]} />
        <meshBasicMaterial color="#d9f9ff" />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.49, -0.42, 0]}>
          <mesh castShadow rotation={[0, 0, side * -0.13]} position={[side * 0.14, -0.25, 0]}>
            <boxGeometry args={[0.3, 1.02, 0.2]} />
            <meshStandardMaterial color="#d96750" flatShading />
          </mesh>
          <mesh castShadow position={[side * 0.17, -0.69, 0]}>
            <coneGeometry args={[0.16, 0.25, 5]} />
            <meshStandardMaterial color="#f3bd63" />
          </mesh>
        </group>
      ))}
      <mesh ref={exhaustOuter} position={[0, -1.65, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.37, 1.2, 12]} />
        <meshBasicMaterial color="#ff9e41" transparent opacity={0.9} />
      </mesh>
      <mesh ref={exhaustInner} position={[0, -1.46, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.2, 0.8, 10]} />
        <meshBasicMaterial color="#fff1ad" />
      </mesh>
      <Sparkles count={12} scale={[1.5, 3, 1.5]} size={3} speed={1.2} color="#ffcf73" position={[0, -1.8, 0]} />
    </group>
  )
}

function Planet() {
  const planet = useRef<Group>(null)

  useFrame((_, delta) => {
    if (planet.current) planet.current.rotation.y += delta * 0.035
  })

  return (
    <group ref={planet} position={[0, -8, -14]}>
      <mesh>
        <sphereGeometry args={[9, 32, 24]} />
        <meshStandardMaterial color="#357b9b" roughness={0.88} />
      </mesh>
      <mesh position={[-3.1, 2.4, 7.9]} scale={[1.05, 0.7, 0.22]}>
        <sphereGeometry args={[2.2, 12, 8]} />
        <meshStandardMaterial color="#5ca77c" flatShading />
      </mesh>
      <mesh position={[3.8, 3.4, 6.9]} scale={[0.74, 1.15, 0.2]} rotation={[0, 0, -0.35]}>
        <sphereGeometry args={[2, 12, 8]} />
        <meshStandardMaterial color="#70bd85" flatShading />
      </mesh>
      <mesh position={[0, 0, 9.03]}>
        <sphereGeometry args={[9.08, 32, 24]} />
        <meshBasicMaterial color="#73d6ef" transparent opacity={0.1} side={1} />
      </mesh>
    </group>
  )
}

export default function RocketJourney() {
  const { camera } = useThree()
  const cameraTarget = useMemo(() => new Vector3(), [])
  const elapsed = useRef(0)

  useFrame((_, delta) => {
    elapsed.current += delta
    const time = Math.min(elapsed.current, 5.5)
    const progress = Math.max(0, time / 5.5 - 0.08)
    const height = 0.3 + progress * progress * 48
    const distance = 11 - progress * 4
    cameraTarget.set(0, height + 2.4, 3 - progress * 18 + distance)
    camera.position.lerp(cameraTarget, Math.min(delta * 2.5, 1))
    camera.lookAt(0, height, 3 - progress * 18)
  })

  return (
    <>
      <color attach="background" args={['#101c3b']} />
      <fog attach="fog" args={['#17234a', 35, 105]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[-6, 10, 8]} intensity={1.6} />
      <Stars radius={100} depth={70} count={1300} factor={3.5} saturation={0.2} fade speed={0.45} />
      <Planet />
      <Rocket />
      <Sparkles count={60} scale={[28, 38, 28]} size={2.2} speed={0.24} color="#bceaff" position={[0, 10, -8]} />
    </>
  )
}
