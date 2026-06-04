/**
 * Logger Utility
 * Centralized logging with levels
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  server?: boolean;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private level: LogLevel = 'info';

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    return levels.indexOf(level) <= levels.indexOf(this.level);
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  error(message: string, error?: any): void {
    if (!this.shouldLog('error')) return;

    const timestamp = this.formatTimestamp();
    const errorStr = error instanceof Error ? error.message : String(error);

    console.error(`[${timestamp}] ❌ ${message}${errorStr ? ': ' + errorStr : ''}`);

    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }

    this.addLog({
      timestamp,
      level: 'error',
      message,
      data: error,
      server: true
    });
  }

  warn(message: string, data?: any): void {
    if (!this.shouldLog('warn')) return;

    const timestamp = this.formatTimestamp();
    console.warn(`[${timestamp}] ⚠️  ${message}`);
    if (data) console.warn(data);

    this.addLog({
      timestamp,
      level: 'warn',
      message,
      data,
      server: false
    });
  }

  info(message: string, data?: any): void {
    if (!this.shouldLog('info')) return;

    const timestamp = this.formatTimestamp();
    console.log(`[${timestamp}]   ${message}`);
    if (data) console.log(data);

    this.addLog({
      timestamp,
      level: 'info',
      message,
      data,
      server: false
    });
  }

  debug(message: string, data?: any): void {
    if (!this.shouldLog('debug')) return;

    const timestamp = this.formatTimestamp();
    console.log(`[${timestamp}]  ${message}`);
    if (data) console.log(data);

    this.addLog({
      timestamp,
      level: 'debug',
      message,
      data,
      server: false
    });
  }

  success(message: string): void {
    const timestamp = this.formatTimestamp();
    console.log(`[${timestamp}]   ${message}`);

    this.addLog({
      timestamp,
      level: 'info',
      message
    });
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (!level) return [...this.logs];
    return this.logs.filter(log => log.level === level);
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new Logger();

export function setLogLevel(level: LogLevel): void {
  logger['level'] = level;
}
