import { Colors } from '@config/colors';

export const DarkTheme = {
  name: 'Dark',
  colors: {
    primary: Colors.Primary,
    secondary: Colors.Secondary,
    success: Colors.Success,
    warning: Colors.Warning,
    error: Colors.Error,
    info: Colors.Info,
    background: Colors.Dark,
    text: Colors.Light,
  },
  embed: {
    color: Colors.Dark,
    footer: {
      iconURL: undefined,
      text: undefined,
    },
    timestamp: true,
  },
} as const;
