export const Colors = {
  // Primary Colors
  Primary: 0x5865f2,
  Secondary: 0x57f287,
  Success: 0x3ba55d,
  Warning: 0xfee75c,
  Error: 0xed4245,
  Info: 0x5865f2,

  // Theme Colors
  Dark: 0x2b2d31,
  Darker: 0x1e1f22,
  Light: 0xffffff,
  Transparent: 0x2b2d31,

  // Status Colors
  Online: 0x3ba55d,
  Idle: 0xfee75c,
  DND: 0xed4245,
  Offline: 0x747f8d,

  // Special Colors
  Blurple: 0x5865f2,
  Greyple: 0x99aab5,
  DarkButNotBlack: 0x2c2f33,
  NotQuiteBlack: 0x23272a,

  // Gaming Theme
  Neon: 0xff00ff,
  Cyan: 0x00ffff,
  Purple: 0x9b59b6,
  Gold: 0xf1c40f,

  // Glassmorphism
  Glass: 0x1a1a1a,
  GlassLight: 0x2d2d2d,
} as const;

export type ColorName = keyof typeof Colors;
