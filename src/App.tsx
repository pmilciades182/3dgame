import { useState } from 'react'
import { Game } from './scenes/Game'
import './App.css'

type Difficulty = 'easy' | 'normal' | 'hard'

interface GameSettings {
  difficulty: Difficulty
  soundEnabled: boolean
  musicVolume: number
  effectsVolume: number
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<'menu' | 'game'>('menu')
  const [settings, setSettings] = useState<GameSettings>({
    difficulty: 'normal',
    soundEnabled: true,
    musicVolume: 0.7,
    effectsVolume: 0.8
  })

  const handleStartGame = () => {
    setCurrentScreen('game')
  }

  const handleSettingsChange = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  if (currentScreen === 'game') {
    return <Game settings={settings} onExit={() => setCurrentScreen('menu')} />
  }

  return (
    <div className="menu-container">
      <div className="menu-content">
        <h1>3D Game</h1>
        
        <div className="menu-section">
          <button className="menu-button" onClick={handleStartGame}>
            Iniciar Juego
          </button>
        </div>

        <div className="menu-section">
          <h2>Dificultad</h2>
          <div className="difficulty-buttons">
            {(['easy', 'normal', 'hard'] as const).map(diff => (
              <button
                key={diff}
                className={`difficulty-button ${settings.difficulty === diff ? 'active' : ''}`}
                onClick={() => handleSettingsChange({ difficulty: diff })}
              >
                {diff === 'easy' ? 'Fácil' : diff === 'normal' ? 'Normal' : 'Difícil'}
              </button>
            ))}
          </div>
        </div>

        <div className="menu-section">
          <h2>Configuración de Sonido</h2>
          <div className="sound-settings">
            <label>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={e => handleSettingsChange({ soundEnabled: e.target.checked })}
              />
              Sonido Activado
            </label>
            
            <div className="volume-control">
              <span>Música</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.musicVolume}
                onChange={e => handleSettingsChange({ musicVolume: parseFloat(e.target.value) })}
              />
            </div>

            <div className="volume-control">
              <span>Efectos</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.effectsVolume}
                onChange={e => handleSettingsChange({ effectsVolume: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
