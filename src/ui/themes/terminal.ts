import { Colors } from '@config/colors';

export const TerminalTheme = {
  name: 'Terminal',
  colors: {
    primary: Colors.Success,
    secondary: Colors.Cyan,
    success: Colors.Success,
    warning: Colors.Warning,
    error: Colors.Error,
    info: Colors.Info,
    background: Colors.NotQuiteBlack,
    text: Colors.Success,
  },
  embed: {
    color: Colors.NotQuiteBlack,
    footer: {
      iconURL: undefined,
      text: '⌨️ Terminal Mode',
    },
    timestamp: true,
  },
} as const;
