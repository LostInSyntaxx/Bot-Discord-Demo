/**
 * Status Emojis - Nitro-style status indicators
 * Use animated emojis (<a:...) for loading states
 * Replace emoji IDs with your server's custom emoji IDs
 */

export const Status = {
  // Core status indicators
  Success: '<a:38899greenloading:1504642766804877372>',
  Error: '<a:status_error:1504624891876606143>',
  Warning: '<a:status_warning:1504506883677880461>',
  Info: '<a:status_info:1504506754841448700>',
  
  // Animated loading states (Nitro-style)
  Loading: '<a:status_loading:1504486187606478990>',
  Processing: '<a:status_processing:1362794777037922434>',
  Spinner: '<a:status_spinner:1362794779106734213>',
  
  // Premium indicators
  Premium: '<:status_premium:1362794781079703643>',
  Nitro: '<:status_nitro:1362794783113486336>',
  Boost: '<a:status_boost:1362794785234141184>',
  
  // Verification levels
  Verified: '<:status_verified:1499005481346138193>',
  Locked: '<:status_locked:1362794789353267264>',
  Unlocked: '<:status_unlocked:1362794791282913344>',
} as const;

export type StatusEmoji = typeof Status[keyof typeof Status];