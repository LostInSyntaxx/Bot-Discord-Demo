export { DarkTheme } from './dark';
export { GamingTheme } from './gaming';
export { GlassmorphismTheme } from './glassmorphism';
export { TerminalTheme } from './terminal';

export type Theme = typeof import('./dark').DarkTheme;
