import { DEBUG_CONFIG } from './config';

export type LogLevel = 'info' | 'warning' | 'error' | 'debug';
export type LogCategory = keyof typeof DEBUG_CONFIG.enabledCategories;

export interface GameLogEntry {
  timestamp: number;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
}

class GameLogger {
  private static instance: GameLogger;
  private logs: GameLogEntry[] = [];
  private isEnabled: boolean = false;
  private logToConsole: boolean = true;
  private autoExportInterval: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    if (DEBUG_CONFIG.export.autoExport) {
      this.startAutoExport();
    }
  }

  static getInstance(): GameLogger {
    if (!GameLogger.instance) {
      GameLogger.instance = new GameLogger();
    }
    return GameLogger.instance;
  }

  private startAutoExport() {
    if (this.autoExportInterval) {
      clearInterval(this.autoExportInterval);
    }
    this.autoExportInterval = setInterval(() => {
      this.saveLogsToFile();
      this.clearLogs();
    }, DEBUG_CONFIG.export.autoExportInterval);
  }

  private stopAutoExport() {
    if (this.autoExportInterval) {
      clearInterval(this.autoExportInterval);
      this.autoExportInterval = null;
    }
  }

  enable(logToConsole: boolean = true) {
    this.isEnabled = true;
    this.logToConsole = logToConsole;
    if (DEBUG_CONFIG.export.autoExport) {
      this.startAutoExport();
    }
  }

  disable() {
    this.isEnabled = false;
    this.stopAutoExport();
  }

  private shouldLog(level: LogLevel, category: LogCategory): boolean {
    if (!this.isEnabled) return false;
    
    // Verificar si el nivel está habilitado
    if (!DEBUG_CONFIG.enabledLevels[level]) return false;
    
    // Verificar si la categoría está habilitada
    if (!DEBUG_CONFIG.enabledCategories[category]) return false;
    
    // Aplicar muestreo si está configurado para la categoría
    const samplingRate = DEBUG_CONFIG.sampling[category as keyof typeof DEBUG_CONFIG.sampling];
    if (samplingRate !== undefined) {
      return Math.random() < samplingRate;
    }
    
    return true;
  }

  log(level: LogLevel, category: LogCategory, message: string, data?: any) {
    if (!this.shouldLog(level, category)) return;

    const entry: GameLogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data
    };

    this.logs.push(entry);

    // Rotar logs si se excede el máximo
    if (this.logs.length > DEBUG_CONFIG.export.maxLogEntries) {
      this.logs = this.logs.slice(-DEBUG_CONFIG.export.maxLogEntries);
    }

    if (this.logToConsole) {
      const formattedTime = new Date(entry.timestamp).toISOString();
      const formattedData = data ? `\nData: ${JSON.stringify(data, null, 2)}` : '';
      console.log(`[${formattedTime}] [${level.toUpperCase()}] [${category}] ${message}${formattedData}`);
    }
  }

  info(category: LogCategory, message: string, data?: any) {
    this.log('info', category, message, data);
  }

  warning(category: LogCategory, message: string, data?: any) {
    this.log('warning', category, message, data);
  }

  error(category: LogCategory, message: string, data?: any) {
    this.log('error', category, message, data);
  }

  debug(category: LogCategory, message: string, data?: any) {
    this.log('debug', category, message, data);
  }

  getLogs(): GameLogEntry[] {
    return [...this.logs];
  }

  getLogsByCategory(category: LogCategory): GameLogEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  getLogsByLevel(level: LogLevel): GameLogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  clearLogs() {
    this.logs = [];
  }

  saveLogsToFile() {
    const blob = new Blob([this.exportLogs()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const logger = GameLogger.getInstance(); 