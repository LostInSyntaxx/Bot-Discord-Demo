import { ExtendedClient } from '@bot-types/Client';
import { BaseService } from '@structures/BaseService';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  timestamp?: boolean;
  color?: boolean;
}

export class LoggerService extends BaseService {
  private logLevel: LogLevel;
  private colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
  };

  constructor(client: ExtendedClient, logLevel: LogLevel = 'info') {
    super(client);
    this.logLevel = logLevel;
  }

  async initialize(): Promise<void> {
    this.info('Logger service initialized');
  }

  async shutdown(): Promise<void> {
    this.info('Logger service shutting down');
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private formatMessage(level: LogLevel, message: string, options: LogOptions = {}): string {
    const { timestamp = true, color = true } = options;
    
    let formatted = '';

    if (timestamp) {
      const now = new Date().toISOString();
      formatted += color ? `${this.colors.dim}[${now}]${this.colors.reset} ` : `[${now}] `;
    }

    const levelColors: Record<LogLevel, string> = {
      debug: this.colors.cyan,
      info: this.colors.blue,
      warn: this.colors.yellow,
      error: this.colors.red,
    };

    const levelColor = color ? levelColors[level] : '';
    const reset = color ? this.colors.reset : '';
    
    formatted += `${levelColor}[${level.toUpperCase()}]${reset} ${message}`;

    return formatted;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  error(message: string, error?: Error | unknown, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), ...args);
      if (error instanceof Error) {
        console.error(error.stack);
      } else if (error) {
        console.error(error);
      }
    }
  }

  command(commandName: string, userId: string, guildId?: string): void {
    const location = guildId ? `Guild: ${guildId}` : 'DM';
    this.info(`Command executed: ${commandName} by ${userId} in ${location}`);
  }

  event(eventName: string, details?: string): void {
    this.debug(`Event: ${eventName}${details ? ` - ${details}` : ''}`);
  }
}
