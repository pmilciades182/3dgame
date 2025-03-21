import { useEffect, useState } from 'react';
import { logger, GameLogEntry } from './GameLogger';
import './DebugOverlay.css';

export const DebugOverlay: React.FC = () => {
  const [logs, setLogs] = useState<GameLogEntry[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  useEffect(() => {
    const updateInterval = setInterval(() => {
      setLogs(logger.getLogs());
    }, 100);

    return () => clearInterval(updateInterval);
  }, []);

  const filteredLogs = logs.filter(log => {
    const categoryMatch = selectedCategory === 'all' || log.category === selectedCategory;
    const levelMatch = selectedLevel === 'all' || log.level === selectedLevel;
    return categoryMatch && levelMatch;
  });

  const categories = ['all', ...new Set(logs.map(log => log.category))];
  const levels = ['all', 'info', 'warning', 'error', 'debug'];

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleExport = () => {
    logger.saveLogsToFile();
  };

  const handleClear = () => {
    logger.clearLogs();
    setLogs([]);
  };

  return (
    <>
      <button 
        className="debug-toggle-button"
        onClick={toggleVisibility}
      >
        {isVisible ? 'Ocultar Debug' : 'Mostrar Debug'}
      </button>

      {isVisible && (
        <div className="debug-overlay">
          <div className="debug-controls">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select 
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              {levels.map(level => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            <button onClick={handleExport}>Exportar Logs</button>
            <button onClick={handleClear}>Limpiar Logs</button>
          </div>

          <div className="debug-log-container">
            {filteredLogs.map((log, index) => (
              <div 
                key={index} 
                className={`debug-log-entry debug-level-${log.level}`}
              >
                <span className="debug-timestamp">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="debug-level">{log.level}</span>
                <span className="debug-category">{log.category}</span>
                <span className="debug-message">{log.message}</span>
                {log.data && (
                  <pre className="debug-data">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}; 