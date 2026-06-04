/**
 * Centralized Emoji Configuration
 * Nitro-style custom emoji system for Discord bot
 * 
 * Usage:
 * import { Status, Utility, Moderation, Navigation, Gaming } from '@config/emoji';
 * 
 * Or use the legacy Emoji object for backward compatibility:
 * import { Emoji } from '@config/emoji';
 */

// Category exports - import all modules first
import { Status, type StatusEmoji } from './status';
import { Utility, type UtilityEmoji } from './utility';
import { Moderation, type ModerationEmoji } from './moderation';
import { Navigation, type NavigationEmoji } from './navigation';
import { Gaming, type GamingEmoji } from './gaming';

// Re-export for external use
export { Status, type StatusEmoji };
export { Utility, type UtilityEmoji };
export { Moderation, type ModerationEmoji };
export { Navigation, type NavigationEmoji };
export { Gaming, type GamingEmoji };

/**
 * Legacy Emoji export for backward compatibility
 * Maps old Emoji keys to new category-based exports
 */
export const Emoji = {
  // Status
  Success: '<a:38899greenloading:1504642766804877372>',
  SuccessVerify: '<a:1446blueverify:1505301141091647498>',
  Error: '<a:6456down:1505233203496095844>',
  Warning: '<:status_warning:1504506883677880461>',
  Info: '<a:status_info:1504506754841448700>',
  Loading: '<a:status_loading:1504486187606478990>',
  Premium: '<:status_premium:1362794781079703643>',
  Nitro: '<:status_nitro:1362794783113486336>',
  Boost: '<a:status_boost:1362794785234141184>',
  Verified: '<:status_verified:1499005481346138193>',
  Locked: '<:status_locked:1362794789353267264>',
  Unlocked: '<:status_unlocked:1362794791282913344>',
  Uptime: '<:57410timer:1505408826248269864>',




  CheckMB: '<a:32877animatedarrowbluelite:1505233213746970795>',
  CheckMP: '<a:51047animatedarrowwhite:1505233220851990528>',
  Refresh: '<:370901refresh:1505401905575100427>',
  CheckPing: '<a:utility_ping:1504624894053453894>',
  CheckPingGreen: '<a:2390offlineinvisible:1504624949405683831>',

  // Utility - Common aliases
  Check: '<a:6456down:1505233203496095844>',
  Cross: '<a:6456down:1505233203496095844>',
  Plus: '<:mod_plus:1362795021071806464>',
  Minus: '<:mod_minus:1362795023201422336>',
  Edit: '<:utility_edit:1362794933747565568>',
  Delete: '<a:73288animatedarrowred:1505233228741611712>',

  // Navigation
  ArrowLeft: '<a:7905_ani_arrow_left:1505201938147311667>',
  ArrowRight: '<a:83918animatedarrowgreen:1505229444992991393>',
  ArrowUp: '<a:9465_ani_arrow_up:1505200287034642545>',
  ArrowDown: '<a:5393_ani_arrow_down:1505200268021731329>',
  Home: '<:nav_home:1362795050605802496>',
  Back: '<:nav_back:1362795052735418368>',
  Forward: '<:nav_forward:1362795054865034240>',

  // Moderation - Common aliases
  Ban: '<:mod_ban:1362794935887175680>',
  Kick: '<:mod_kick:1362794942276019200>',
  Mute: '<:mod_mute:1362794948664866816>',
  Unmute: '<:mod_unmute:1362794950794482688>',
  Warn: '<:mod_warn:1362794957183330304>',
  Lock: '<:mod_lock:1362794963572177920>',
  Unlock: '<:mod_unlock:1362794965701793792>',
  Timeout: '<:mod_timeout:1362794946535250944>',

  // Utility - User/Server
  User: '<:utility_user:1499069271161180253>',
  Users: '<:utility_user:1499069271161180253>',
  UserAdd: '<:utility_user:1499069271161180253>',
  UserRemove: '<:utility_user:1499069271161180253>',
  Server: '<:serversolid:1505288295897235466>',
  Bot: '<:utility_bot:1362794827260284928>',
  Crown: '<a:47232crowngreen:1505290790992085010>',
  Shield: '<:439168shield:1505290140640084131>',
  Graph: '<:utility_database:1362795314677565440>',
  Heart: '<:status_verified:1499005481346138193>',

  // Utility - General
  Search: '<:utility_search:1362794795308478555>',
  Settings: '<a:5666settings:1505293953929445377>',
  Help: '<a:38899greenloading:1504642766804877372>',
  Ping: '<a:utility_ping:1504624894053453894>',
  Stats: '<a:38899greenloading:1504642766804877372>',
  Calendar: '<a:99609calendar:1505289393177628672>',
  Clock: '<a:utility_clock:1504625821908861118>',
  Code: '<:utility_code:1362794882636991488>',
  Terminal: '<:utility_terminal:1362794884766607360>',

  // Gaming
  Game: '<:gaming_game:1362795148568131584>',
  Trophy: '<:gaming_trophy:1362795157086595072>',
  Medal: '<:gaming_medal:1362795165605058560>',
  Fire: '<:gaming_fire:1362795178382753792>',
  Rocket: '<:gaming_rocket:1362795189030833152>',

  // Misc
  Music: '<:1161music:1504641983065489549>',
  MusicPause: '<:6148pause:1504641989067407542>',
  MusicResume: '<:5134resume:1504641986869596183>',
  MusicReplay: '<:8562replay:1504641991194181722>',
  MusicLoop: '<a:2951loop:1504642749532606644>',
  MusicAdd: '<:1484pluse:1504642739474796684>',
  MusicSearch: '<:2125search:1504642743945662484>',
  MusicSettings: '<:2888settings:1504642747355762890>',
  MusicDelete: '<:4151deleteguild:1504642751172706314>',
  MusicVolume: '<:7138screensharevolume:1504642759141883974>',
  MusicVolumeOff: '<:1327screensharevolumeoff:1504642737662726197>',
  MusicLoading: '<a:1792loading:1504641985171165265>',
  Link: '<:utility_link:1362794899673711616>',
  Database: '<:utility_database:1362795314677565440>',
} as const;

export type EmojiName = keyof typeof Emoji;

/**
 * Helper function to get emoji by category
 * Returns the full emoji object for a specific category
 */
export function getEmojiCategory(category: 'status' | 'utility' | 'moderation' | 'navigation' | 'gaming') {
  switch (category) {
    case 'status':
      return Status;
    case 'utility':
      return Utility;
    case 'moderation':
      return Moderation;
    case 'navigation':
      return Navigation;
    case 'gaming':
      return Gaming;
  }
}

/**
 * Get a specific emoji by name across all categories
 */
export function getEmoji(name: string): string {
  // Check Status
  if (name in Status) return Status[name as keyof typeof Status];
  // Check Utility
  if (name in Utility) return Utility[name as keyof typeof Utility];
  // Check Moderation
  if (name in Moderation) return Moderation[name as keyof typeof Moderation];
  // Check Navigation
  if (name in Navigation) return Navigation[name as keyof typeof Navigation];
  // Check Gaming
  if (name in Gaming) return Gaming[name as keyof typeof Gaming];
  // Check legacy Emoji
  if (name in Emoji) return Emoji[name as keyof typeof Emoji];

  // Default fallback
  return '<a:status_info:1504506754841448700>';
}