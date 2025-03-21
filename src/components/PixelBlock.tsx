import { useRef } from 'react'
import * as THREE from 'three'

type PixelBlockProps = {
  position: [number, number, number]
  color?: string
}

export const PixelBlock = ({ position, color = '#4CAF50' }: PixelBlockProps) => {
  const meshRef = useRef<THREE.Mesh>(null)

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 0.5, 1]} />
      <meshStandardMaterial 
        color={color}
        roughness={0.8}
        metalness={0.2}
        flatShading={true}
      />
    </mesh>
  )
} 