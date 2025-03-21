import { useRef, forwardRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'

const MOVEMENT_SPEED = 5
const ROTATION_SPEED = 5
const LERP_FACTOR = 0.1

export const Character = forwardRef<THREE.Group>((props, ref) => {
  const characterRef = useRef<THREE.Group>(null)
  const velocityRef = useRef(new THREE.Vector3())
  const targetRotationRef = useRef(0)

  const [, getKeys] = useKeyboardControls()

  useFrame((state, delta) => {
    if (!characterRef.current) return

    const { forward, backward, left, right } = getKeys()
    const character = characterRef.current

    // Calcular dirección de movimiento
    const moveDirection = new THREE.Vector3()
    if (forward) moveDirection.z -= 1
    if (backward) moveDirection.z += 1
    if (left) moveDirection.x -= 1
    if (right) moveDirection.x += 1
    moveDirection.normalize()

    // Actualizar rotación objetivo
    if (moveDirection.length() > 0) {
      targetRotationRef.current = Math.atan2(moveDirection.x, moveDirection.z)
    }

    // Aplicar rotación suave
    const currentRotation = character.rotation.y
    const rotationDiff = targetRotationRef.current - currentRotation
    character.rotation.y += rotationDiff * LERP_FACTOR * ROTATION_SPEED * delta

    // Actualizar velocidad con aceleración suave
    const targetVelocity = moveDirection.multiplyScalar(MOVEMENT_SPEED)
    velocityRef.current.lerp(targetVelocity, LERP_FACTOR)

    // Aplicar movimiento
    character.position.add(velocityRef.current.clone().multiplyScalar(delta))
  })

  useEffect(() => {
    if (characterRef.current && ref) {
      if (typeof ref === 'function') {
        ref(characterRef.current)
      } else {
        ref.current = characterRef.current
      }
    }
  }, [ref])

  return (
    <group ref={characterRef}>
      <mesh castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4287f5" />
      </mesh>
    </group>
  )
})

Character.displayName = 'Character' 