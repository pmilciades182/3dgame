import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface TerrainProps {
  speed?: number
  gapSize?: number
  onCollision?: () => void
  onScore?: () => void
}

const PIPE_SPACING = 15
const PIPE_WIDTH = 2
const PIPE_HEIGHT = 20

export function Terrain({ speed = 1, gapSize = 4, onCollision, onScore }: TerrainProps) {
  const groupRef = useRef<THREE.Group>(null)
  const pipesRef = useRef<THREE.Group[]>([])
  const scoreCheckRef = useRef<boolean[]>([])

  // Crear geometrías compartidas
  const pipeGeometry = useMemo(() => new THREE.BoxGeometry(PIPE_WIDTH, PIPE_HEIGHT, PIPE_WIDTH), [])
  const pipeMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#00ff87',
    metalness: 0.5,
    roughness: 0.3,
  }), [])

  // Generar posiciones iniciales de los tubos
  const pipePositions = useMemo(() => {
    const positions = []
    for (let i = 0; i < 5; i++) {
      const x = i * PIPE_SPACING
      const gap = (Math.random() - 0.5) * 10
      positions.push({ x, gap })
    }
    return positions
  }, [])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Mover los tubos hacia la izquierda
    groupRef.current.position.x -= speed * 5 * delta

    // Reciclar tubos
    pipesRef.current.forEach((pipe, index) => {
      const worldPosition = new THREE.Vector3()
      pipe.getWorldPosition(worldPosition)

      if (worldPosition.x < -20) {
        // Mover el tubo al final
        const lastPipeX = Math.max(...pipesRef.current.map(p => {
          const pos = new THREE.Vector3()
          p.getWorldPosition(pos)
          return pos.x
        }))
        
        pipe.position.x = lastPipeX + PIPE_SPACING
        pipe.position.y = (Math.random() - 0.5) * 10
        scoreCheckRef.current[index] = false
      }

      // Comprobar puntuación
      if (!scoreCheckRef.current[index] && worldPosition.x < 0) {
        scoreCheckRef.current[index] = true
        onScore?.()
      }
    })
  })

  return (
    <group ref={groupRef}>
      {/* Fondo */}
      <mesh position={[0, 0, -10]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#87ceeb" />
      </mesh>

      {/* Tubos */}
      {pipePositions.map((pos, i) => (
        <group key={i} position={[pos.x, pos.gap, 0]} ref={el => el && (pipesRef.current[i] = el)}>
          {/* Tubo superior */}
          <group position={[0, gapSize + PIPE_HEIGHT/2, 0]}>
            <mesh
              geometry={pipeGeometry}
              material={pipeMaterial}
              castShadow
              receiveShadow
            />
            {/* Borde del tubo superior */}
            <mesh position={[0, -PIPE_HEIGHT/2, 0]}>
              <cylinderGeometry args={[PIPE_WIDTH * 0.7, PIPE_WIDTH * 0.7, 1, 32]} />
              <meshStandardMaterial color="#00cc6a" />
            </mesh>
          </group>

          {/* Tubo inferior */}
          <group position={[0, -gapSize - PIPE_HEIGHT/2, 0]}>
            <mesh
              geometry={pipeGeometry}
              material={pipeMaterial}
              castShadow
              receiveShadow
            />
            {/* Borde del tubo inferior */}
            <mesh position={[0, PIPE_HEIGHT/2, 0]}>
              <cylinderGeometry args={[PIPE_WIDTH * 0.7, PIPE_WIDTH * 0.7, 1, 32]} />
              <meshStandardMaterial color="#00cc6a" />
            </mesh>
          </group>
        </group>
      ))}

      {/* Suelo */}
      <mesh position={[0, -15, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1000, 100]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
    </group>
  )
} 