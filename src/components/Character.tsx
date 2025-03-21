import { useRef, forwardRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'
import { logger } from '../debug/GameLogger'

interface CharacterProps {
  speed?: number
  onCollision?: () => void
  onScore?: () => void
}

const GRAVITY = 15
const JUMP_FORCE = 8
const MAX_VELOCITY = 10

export const Character = forwardRef<THREE.Group, CharacterProps>(({ speed = 1, onCollision, onScore }, ref) => {
  const characterRef = useRef<THREE.Group>(null)
  const velocityRef = useRef(0)
  const rotationRef = useRef(0)
  const [, getKeys] = useKeyboardControls()

  useEffect(() => {
    logger.debug('character', 'Personaje inicializado', { speed });
  }, [speed]);

  useFrame((state, delta) => {
    if (!characterRef.current) return

    const { forward } = getKeys()
    const character = characterRef.current

    // Aplicar gravedad
    const prevVelocity = velocityRef.current;
    velocityRef.current += GRAVITY * delta
    velocityRef.current = Math.min(velocityRef.current, MAX_VELOCITY)

    // Salto
    if (forward) {
      velocityRef.current = -JUMP_FORCE;
      logger.debug('character', 'Salto ejecutado', {
        position: character.position.toArray(),
        prevVelocity,
        newVelocity: velocityRef.current
      });
    }

    // Actualizar posición
    const prevY = character.position.y;
    character.position.y -= velocityRef.current * delta

    // Rotar el personaje basado en la velocidad
    const targetRotation = THREE.MathUtils.clamp(velocityRef.current * 0.2, -Math.PI / 4, Math.PI / 4)
    rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetRotation, 0.1)
    character.rotation.z = rotationRef.current

    // Mover automáticamente hacia adelante
    character.position.x += speed * 5 * delta

    // Límites de la pantalla
    if (character.position.y < -10 || character.position.y > 10) {
      logger.warning('character', 'Colisión con límites', {
        position: character.position.toArray(),
        velocity: velocityRef.current,
        deltaY: character.position.y - prevY
      });
      onCollision?.()
    }

    // Log de estado cada cierto intervalo
    if (Math.random() < 0.01) { // Log aproximadamente cada 100 frames
      logger.debug('character', 'Estado del personaje', {
        position: character.position.toArray(),
        velocity: velocityRef.current,
        rotation: rotationRef.current,
        deltaY: character.position.y - prevY
      });
    }
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
      {/* Cuerpo principal */}
      <mesh castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#4287f5" />
      </mesh>
      {/* Alas */}
      <mesh position={[0, 0.3, 0.4]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.6, 0.1, 0.2]} />
        <meshStandardMaterial color="#2d6ed9" />
      </mesh>
      <mesh position={[0, 0.3, -0.4]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.6, 0.1, 0.2]} />
        <meshStandardMaterial color="#2d6ed9" />
      </mesh>
      {/* Cola */}
      <mesh position={[-0.4, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.4, 0.1, 0.3]} />
        <meshStandardMaterial color="#2d6ed9" />
      </mesh>
    </group>
  )
})

Character.displayName = 'Character' 