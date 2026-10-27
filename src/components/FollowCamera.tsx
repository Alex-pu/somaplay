import { useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { MutableRefObject } from 'react'
import type { RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'

export default function FollowCamera({
  player,
  yaw,
}: {
  player: MutableRefObject<RapierRigidBody | null>
  yaw: MutableRefObject<number>
}) {
  const { camera, gl } = useThree()

  useEffect(() => {
    camera.position.set(0, 5, 12)
    const canvas = gl.domElement
    let dragging = false
    let lastX = 0
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      dragging = true
      lastX = event.clientX
      canvas.setPointerCapture(event.pointerId)
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return
      yaw.current -= (event.clientX - lastX) * 0.006
      lastX = event.clientX
    }
    const onPointerUp = () => { dragging = false }
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)
    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
    }
  }, [camera, gl, yaw])

  useFrame((_, delta) => {
    const body = player.current
    if (!body) return
    const { x, y, z } = body.translation()
    const distance = Math.min(delta * 5, 1)
    const target = new THREE.Vector3(
      x + Math.sin(yaw.current) * 7,
      y + 4.1,
      z + Math.cos(yaw.current) * 7,
    )
    camera.position.lerp(target, distance)
    camera.lookAt(x, y + 1.05, z)
  })

  return null
}
