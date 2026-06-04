import { Colors } from '@config/colors';

export const GlassmorphismTheme = {
  name: 'Glassmorphism',
  colors: {
    primary: Colors.Blurple,
    secondary: Colors.Cyan,
    success: Colors.Success,
    warning: Colors.Warning,
    error: Colors.Error,
    info: Colors.Info,
    background: Colors.Glass,
    text: Colors.Light,
  },
  embed: {
    color: Colors.GlassLight,
    footer: {
      iconURL: undefined,
      text: '✨ Glass UI',
    },
    timestamp: true,
  },
} as const;
