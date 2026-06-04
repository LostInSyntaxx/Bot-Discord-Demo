import { Colors } from '@config/colors';

export const GamingTheme = {
  name: 'Gaming',
  colors: {
    primary: Colors.Neon,
    secondary: Colors.Cyan,
    success: Colors.Success,
    warning: Colors.Warning,
    error: Colors.Error,
    info: Colors.Purple,
    background: Colors.NotQuiteBlack,
    text: Colors.Light,
  },
  embed: {
    color: Colors.Neon,
    footer: {
      iconURL: undefined,
      text: '🎮 Gaming Mode',
    },
    timestamp: true,
  },
} as const;
