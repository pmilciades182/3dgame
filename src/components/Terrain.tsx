import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { logger } from '../debug/GameLogger'

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

  useEffect(() => {
    logger.debug('terrain', 'Terreno inicializado', { speed, gapSize });
  }, [speed, gapSize]);

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
    logger.debug('terrain', 'Posiciones iniciales de tubos generadas', { positions });
    return positions
  }, [])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Mover los tubos hacia la izquierda
    const prevX = groupRef.current.position.x;
    groupRef.current.position.x -= speed * 5 * delta

    // Log de movimiento cada cierto intervalo
    if (Math.random() < 0.01) { // Log aproximadamente cada 100 frames
      logger.debug('terrain', 'Movimiento del terreno', {
        position: groupRef.current.position.toArray(),
        deltaX: groupRef.current.position.x - prevX,
        speed
      });
    }

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
        
        const newX = lastPipeX + PIPE_SPACING;
        const newY = (Math.random() - 0.5) * 10;
        pipe.position.x = newX;
        pipe.position.y = newY;
        scoreCheckRef.current[index] = false;

        logger.debug('terrain', 'Tubo reciclado', {
          index,
          oldPosition: worldPosition.toArray(),
          newPosition: [newX, newY, 0]
        });
      }

      // Comprobar puntuación
      if (!scoreCheckRef.current[index] && worldPosition.x < 0) {
        scoreCheckRef.current[index] = true;
        logger.info('terrain', 'Punto obtenido', {
          pipeIndex: index,
          position: worldPosition.toArray()
        });
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