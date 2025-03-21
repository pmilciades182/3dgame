import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

const GRID_SIZE = 20
const CELL_SIZE = 2
const GRID_DIVISIONS = GRID_SIZE / CELL_SIZE

export function Terrain() {
  // Crear la geometría del plano base
  const planeGeometry = useMemo(() => {
    return new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE, GRID_DIVISIONS, GRID_DIVISIONS)
  }, [])

  // Crear la geometría de la cuadrícula
  const gridGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const vertices = []

    // Crear líneas horizontales
    for (let i = 0; i <= GRID_SIZE; i += CELL_SIZE) {
      vertices.push(-GRID_SIZE/2, 0, i - GRID_SIZE/2)
      vertices.push(GRID_SIZE/2, 0, i - GRID_SIZE/2)
    }

    // Crear líneas verticales
    for (let i = 0; i <= GRID_SIZE; i += CELL_SIZE) {
      vertices.push(i - GRID_SIZE/2, 0, -GRID_SIZE/2)
      vertices.push(i - GRID_SIZE/2, 0, GRID_SIZE/2)
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    return geometry
  }, [])

  return (
    <group>
      {/* Plano base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <primitive object={planeGeometry} />
        <meshStandardMaterial
          color="#8eb8e5"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Cuadrícula */}
      <lineSegments rotation={[-Math.PI / 2, 0, 0]}>
        <primitive object={gridGeometry} />
        <lineBasicMaterial color="#ffffff" opacity={0.2} transparent />
      </lineSegments>

      {/* Elementos decorativos */}
      {Array.from({ length: 10 }).map((_, i) => (
        <group key={i} position={[
          (Math.random() - 0.5) * GRID_SIZE * 0.8,
          0.5,
          (Math.random() - 0.5) * GRID_SIZE * 0.8
        ]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.5, 1, 0.5]} />
            <meshStandardMaterial color="#4a6670" />
          </mesh>
        </group>
      ))}
    </group>
  )
} 