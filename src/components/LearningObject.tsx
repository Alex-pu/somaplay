import { useMemo } from 'react'
import { Billboard, Text } from '@react-three/drei'
import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import type { VocabularyItem } from '../data/vocabulary'
import AnimalModel from './AnimalModel'
import VehicleModel from './VehicleModel'

function Tree({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.22, 0.34, 1.7, 7]} />
        <meshStandardMaterial color="#865735" />
      </mesh>
      <mesh castShadow position={[0, 2.05, 0]}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh castShadow position={[-0.6, 1.7, 0.15]}>
        <icosahedronGeometry args={[0.72, 1]} />
        <meshStandardMaterial color="#68ae5a" flatShading />
      </mesh>
    </group>
  )
}

function House({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.18, 0]}>
        <boxGeometry args={[2.9, 0.36, 2.35]} />
        <meshStandardMaterial color="#a96f4f" flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.05, 0]}>
        <boxGeometry args={[2.5, 2.1, 2]} />
        <meshStandardMaterial color="#f1d8a6" flatShading />
      </mesh>
      <mesh castShadow position={[0, 2.35, 0]}>
        <coneGeometry args={[1.95, 1.5, 4]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh castShadow position={[0, 2.1, 1.01]}>
        <boxGeometry args={[2.9, 0.16, 0.18]} />
        <meshStandardMaterial color="#f5e4bc" />
      </mesh>
      <mesh castShadow position={[-0.94, 1.08, 1.04]}>
        <boxGeometry args={[0.08, 0.82, 0.11]} />
        <meshStandardMaterial color="#bb7852" />
      </mesh>
      <mesh castShadow position={[0.94, 1.08, 1.04]}>
        <boxGeometry args={[0.08, 0.82, 0.11]} />
        <meshStandardMaterial color="#bb7852" />
      </mesh>
      <mesh castShadow position={[0, 0.72, 1.03]}>
        <boxGeometry args={[0.55, 1.35, 0.08]} />
        <meshStandardMaterial color="#724b38" />
      </mesh>
      <mesh position={[0.17, 0.73, 1.09]}>
        <sphereGeometry args={[0.055, 10, 10]} />
        <meshStandardMaterial color="#f0c457" metalness={0.35} />
      </mesh>
      {[-0.68, 0.68].map((x) => (
        <group key={x} position={[x, 1.38, 1.055]}>
          <mesh castShadow>
            <boxGeometry args={[0.52, 0.55, 0.1]} />
            <meshStandardMaterial color="#9bd1d1" emissive="#74aeb1" emissiveIntensity={0.12} />
          </mesh>
          <mesh castShadow position={[0, 0, 0.065]}>
            <boxGeometry args={[0.6, 0.11, 0.08]} />
            <meshStandardMaterial color="#bf7854" />
          </mesh>
          <mesh castShadow position={[0, -0.28, 0.065]}>
            <boxGeometry args={[0.6, 0.1, 0.08]} />
            <meshStandardMaterial color="#bf7854" />
          </mesh>
          <mesh castShadow position={[0, 0, 0.11]}>
            <boxGeometry args={[0.08, 0.55, 0.07]} />
            <meshStandardMaterial color="#f4e0b8" />
          </mesh>
        </group>
      ))}
      <mesh castShadow position={[0.78, 2.72, -0.35]}>
        <boxGeometry args={[0.42, 1.1, 0.42]} />
        <meshStandardMaterial color="#ad6851" flatShading />
      </mesh>
      <mesh position={[0.78, 3.3, -0.35]}>
        <cylinderGeometry args={[0.24, 0.24, 0.16, 7]} />
        <meshStandardMaterial color="#f2d29c" />
      </mesh>
      <mesh castShadow position={[0, 2.03, 0.56]}>
        <boxGeometry args={[0.7, 0.13, 1.15]} />
        <meshStandardMaterial color="#efa95b" />
      </mesh>
      <mesh castShadow position={[0, 1.85, 1.05]}>
        <boxGeometry args={[0.65, 0.36, 0.1]} />
        <meshStandardMaterial color="#e87852" flatShading />
      </mesh>
      {[-0.78, 0, 0.78].map((x) => (
        <group key={x} position={[x, 0.29, 1.26]}>
          <mesh castShadow position={[0, 0.12, 0]}>
            <boxGeometry args={[0.28, 0.3, 0.22]} />
            <meshStandardMaterial color="#b87851" flatShading />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <icosahedronGeometry args={[0.22, 1]} />
            <meshStandardMaterial color={x === 0 ? '#edbb52' : '#82a956'} flatShading />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 3.25, 0]}>
        <sphereGeometry args={[0.12, 10, 8]} />
        <meshStandardMaterial color="#ffe09a" emissive="#ffcc72" emissiveIntensity={0.55} />
      </mesh>
    </group>
  )
}

export default function LearningObject({ item }: { item: VocabularyItem }) {
  const position = useMemo(() => item.position, [item.position])

  return (
    <group position={position}>
      <RigidBody type="fixed" colliders={false}>
        {item.kind === 'tree' ? (
          <CylinderCollider args={[0.85, 0.34]} position={[0, 0.85, 0]} />
        ) : item.kind === 'house' ? (
          <CuboidCollider args={[1.3, 1.05, 1.1]} position={[0, 1.05, 0]} />
        ) : item.kind === 'taxi' ? (
          <CuboidCollider args={[1.3, 0.75, 1.9]} position={[0, 0.75, 0]} />
        ) : (
          <CuboidCollider
            args={item.kind === 'elephant' ? [0.95, 0.9, 1.2] : item.kind === 'dog' ? [0.55, 0.65, 0.65] : [0.72, 0.7, 0.75]}
            position={[0, 0.7, 0.1]}
          />
        )}
      </RigidBody>
      {item.kind === 'tree' && <Tree color={item.color} />}
      {item.kind === 'house' && <House color={item.color} />}
      {item.kind === 'taxi' && <VehicleModel />}
      {item.kind !== 'tree' && item.kind !== 'house' && item.kind !== 'taxi' && (
        <AnimalModel kind={item.kind} />
      )}
      <Billboard position={[0, item.kind === 'tree' ? 3.5 : item.kind === 'house' ? 3.4 : item.kind === 'elephant' ? 3.1 : item.kind === 'taxi' ? 2.8 : 2.35, 0]}>
        <Text
          fontSize={0.34}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.035}
          outlineColor="#fff8e9"
          color="#344a37"
        >
          {item.english}
        </Text>
      </Billboard>
    </group>
  )
}
