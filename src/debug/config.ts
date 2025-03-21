export const DEBUG_CONFIG = {
  // Categorías habilitadas para logging
  enabledCategories: {
    game: true,      // Logs generales del juego
    character: true, // Logs del personaje
    terrain: true,   // Logs del terreno
    collision: true, // Logs de colisiones
    input: true,     // Logs de entrada de usuario
    score: true,     // Logs de puntuación
  },

  // Niveles de log habilitados
  enabledLevels: {
    debug: true,
    info: true,
    warning: true,
    error: true,
  },

  // Configuración de muestreo
  sampling: {
    character: 0.01,  // Frecuencia de logging para el estado del personaje (1%)
    terrain: 0.01,    // Frecuencia de logging para el estado del terreno (1%)
  },

  // Configuración de exportación
  export: {
    autoExport: false,           // Exportar logs automáticamente
    autoExportInterval: 60000,   // Intervalo de exportación automática (ms)
    maxLogEntries: 10000,        // Número máximo de entradas antes de rotar
  }
}; 