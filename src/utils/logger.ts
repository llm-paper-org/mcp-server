/**
 * Logging utilities for MCP server
 */

export type LogLevel = 'debug' | 'info' | 'notice' | 'warning' | 'error' | 'critical' | 'alert' | 'emergency';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  notice: 2,
  warning: 3,
  error: 4,
  critical: 5,
  alert: 6,
  emergency: 7,
};

class Logger {
  private currentLevel: LogLevel = 'info';
  private loggers: Map<string, Logger> = new Map();

  constructor(private name: string = 'default') {}

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  getLevel(): LogLevel {
    return this.currentLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.currentLevel];
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `${timestamp} [${level.toUpperCase()}] [${this.name}] ${message}${dataStr}`;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, data));
    }
  }

  notice(message: string, data?: any): void {
    if (this.shouldLog('notice')) {
      console.info(this.formatMessage('notice', message, data));
    }
  }

  warning(message: string, data?: any): void {
    if (this.shouldLog('warning')) {
      console.warn(this.formatMessage('warning', message, data));
    }
  }

  error(message: string, data?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, data));
    }
  }

  critical(message: string, data?: any): void {
    if (this.shouldLog('critical')) {
      console.error(this.formatMessage('critical', message, data));
    }
  }

  alert(message: string, data?: any): void {
    if (this.shouldLog('alert')) {
      console.error(this.formatMessage('alert', message, data));
    }
  }

  emergency(message: string, data?: any): void {
    if (this.shouldLog('emergency')) {
      console.error(this.formatMessage('emergency', message, data));
    }
  }

  child(name: string): Logger {
    const childName = `${this.name}:${name}`;
    if (!this.loggers.has(childName)) {
      const childLogger = new Logger(childName);
      childLogger.setLevel(this.currentLevel);
      this.loggers.set(childName, childLogger);
    }
    return this.loggers.get(childName)!;
  }
}

// Default logger instance
export const logger = new Logger('mcp-server');

// Function to get a named logger
export function getLogger(name: string): Logger {
  return logger.child(name);
}

// Function to set global log level
export function setLogLevel(level: LogLevel): void {
  logger.setLevel(level);
}