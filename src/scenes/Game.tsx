import { Canvas } from '@react-three/fiber'
import { Environment, KeyboardControls, KeyboardControlsEntry } from '@react-three/drei'
import { Suspense, useRef, useState, useEffect } from 'react'
import { Terrain } from '../components/Terrain'
import { Character } from '../components/Character'
import * as THREE from 'three'
import { logger } from '../debug/GameLogger'
import { DebugOverlay } from '../debug/DebugOverlay'

interface GameProps {
  settings: {
    difficulty: 'easy' | 'normal' | 'hard'
    soundEnabled: boolean
    musicVolume: number
    effectsVolume: number
  }
  onExit: () => void
}

type Controls = 'forward' | 'exit'

const controls: KeyboardControlsEntry<Controls>[] = [
  { name: 'forward', keys: ['ArrowUp', 'w', ' '] },
  { name: 'exit', keys: ['Escape'] },
]

interface SceneProps {
  difficulty: GameProps['settings']['difficulty']
  onGameOver: () => void
  onScoreChange: (score: number) => void
}

function Scene({ difficulty, onGameOver, onScoreChange }: SceneProps) {
  const characterRef = useRef<THREE.Group>(null)
  const [isGameOver, setIsGameOver] = useState(false)
  const scoreRef = useRef(0)

  useEffect(() => {
    logger.enable();
    logger.info('game', 'Iniciando nueva partida', { difficulty });
    return () => logger.disable();
  }, [difficulty]);

  // Ajustar parámetros según la dificultad
  const getGameParameters = () => {
    const params = {
      easy: { speed: 0.8, gapSize: 5 },
      normal: { speed: 1, gapSize: 4 },
      hard: { speed: 1.2, gapSize: 3 }
    }[difficulty];
    
    logger.debug('game', 'Parámetros de juego configurados', params);
    return params;
  }

  const gameParams = getGameParameters()

  const handleCollision = () => {
    if (!isGameOver) {
      logger.warning('collision', 'Colisión detectada', {
        position: characterRef.current?.position,
        score: scoreRef.current
      });
      setIsGameOver(true)
      onGameOver()
    }
  }

  const handleScore = () => {
    if (!isGameOver) {
      scoreRef.current += 1
      logger.info('score', 'Punto obtenido', { 
        newScore: scoreRef.current,
        position: characterRef.current?.position 
      });
      onScoreChange(scoreRef.current)
    }
  }

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />
      
      <Terrain 
        speed={gameParams.speed} 
        gapSize={gameParams.gapSize}
        onCollision={handleCollision}
        onScore={handleScore}
      />
      
      <Character 
        ref={characterRef}
        speed={gameParams.speed}
        onCollision={handleCollision}
      />
      
      <Environment preset="sunset" />
    </>
  )
}

export function Game({ settings, onExit }: GameProps) {
  const [showGameOver, setShowGameOver] = useState(false)
  const [currentScore, setCurrentScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('highScore')
    return saved ? parseInt(saved) : 0
  })

  useEffect(() => {
    logger.info('game', 'Configuración del juego cargada', settings);
  }, [settings]);

  const handleGameOver = () => {
    if (currentScore > highScore) {
      logger.info('score', 'Nuevo récord establecido', {
        oldHighScore: highScore,
        newHighScore: currentScore
      });
      setHighScore(currentScore)
      localStorage.setItem('highScore', currentScore.toString())
    }
    setShowGameOver(true)
  }

  const handleRestart = () => {
    logger.info('game', 'Reiniciando partida');
    setCurrentScore(0)
    setShowGameOver(false)
  }

  const handleScoreChange = (newScore: number) => {
    setCurrentScore(newScore)
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <KeyboardControls
        map={controls}
        onChange={(name, pressed) => {
          if (name === 'exit' && pressed) {
            logger.info('input', 'Saliendo del juego');
            onExit()
          }
          logger.debug('input', 'Control activado', { name, pressed });
        }}
      >
        <Canvas camera={{ position: [0, 0, 20], fov: 75, near: 0.1, far: 1000 }}>
          <Suspense fallback={null}>
            <Scene 
              difficulty={settings.difficulty} 
              onGameOver={handleGameOver}
              onScoreChange={handleScoreChange}
            />
          </Suspense>
        </Canvas>
      </KeyboardControls>
      
      {/* HUD */}
      <div className="game-hud">
        <div className="score">Puntuación: {currentScore}</div>
      </div>

      <div className="game-overlay">
        <button className="exit-button" onClick={onExit}>
          Volver al Menú
        </button>
      </div>

      {showGameOver && (
        <div className="game-over-overlay">
          <div className="game-over-content">
            <h2>¡Juego Terminado!</h2>
            <p className="final-score">Puntuación: {currentScore}</p>
            <p className="high-score">Mejor Puntuación: {highScore}</p>
            <button className="menu-button" onClick={handleRestart}>
              Intentar de Nuevo
            </button>
            <button className="menu-button" onClick={onExit}>
              Volver al Menú
            </button>
          </div>
        </div>
      )}

      <DebugOverlay />
    </div>
  )
} 