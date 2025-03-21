import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

const CAMERA_DISTANCE = 10
const CAMERA_HEIGHT = 5
const LERP_FACTOR = 0.1
const LOOK_AHEAD = 2

interface FollowCameraProps {
  target: THREE.Group | null
}

export function FollowCamera({ target }: FollowCameraProps) {
  const cameraPositionRef = useRef(new THREE.Vector3(0, CAMERA_HEIGHT, CAMERA_DISTANCE))
  const lookAtPositionRef = useRef(new THREE.Vector3())

  useFrame((state) => {
    if (!target) return

    const targetPosition = target.position
    const targetRotation = target.rotation.y

    // Calcular la posición objetivo de la cámara
    const idealOffset = new THREE.Vector3(
      -Math.sin(targetRotation) * CAMERA_DISTANCE,
      CAMERA_HEIGHT,
      -Math.cos(targetRotation) * CAMERA_DISTANCE
    )

    // Calcular el punto de mira adelantado
    const lookAheadPoint = new THREE.Vector3(
      targetPosition.x + Math.sin(targetRotation) * LOOK_AHEAD,
      targetPosition.y,
      targetPosition.z + Math.cos(targetRotation) * LOOK_AHEAD
    )

    // Aplicar suavizado a la posición de la cámara
    cameraPositionRef.current.lerp(
      targetPosition.clone().add(idealOffset),
      LERP_FACTOR
    )

    // Aplicar suavizado al punto de mira
    lookAtPositionRef.current.lerp(lookAheadPoint, LERP_FACTOR)

    // Actualizar la cámara
    state.camera.position.copy(cameraPositionRef.current)
    state.camera.lookAt(lookAtPositionRef.current)
  })

  return null
} 