import { Canvas } from '@react-three/fiber'
import { Environment, KeyboardControls } from '@react-three/drei'
import { Suspense, useRef } from 'react'
import { Terrain } from './components/Terrain'
import { Character } from './components/Character'
import { FollowCamera } from './components/FollowCamera'
import * as THREE from 'three'

const controls = [
  { name: 'forward', keys: ['ArrowUp', 'w'] },
  { name: 'backward', keys: ['ArrowDown', 's'] },
  { name: 'left', keys: ['ArrowLeft', 'a'] },
  { name: 'right', keys: ['ArrowRight', 'd'] },
]

function Scene() {
  const characterRef = useRef<THREE.Group>(null)

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />
      <Terrain />
      <Character ref={characterRef} />
      <FollowCamera target={characterRef.current} />
      <Environment preset="sunset" />
    </>
  )
}

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <KeyboardControls map={controls}>
        <Canvas camera={{ position: [0, 5, 10], fov: 75, near: 0.1, far: 1000 }}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </div>
  )
}

export default App
