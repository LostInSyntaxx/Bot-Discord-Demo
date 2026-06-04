/**
 * Moderation Emojis - Nitro-style moderation action icons
 * Premium dashboard-style icons for moderation commands
 * Replace emoji IDs with your server's custom emoji IDs
 */

export const Moderation = {
  // Ban actions
  Ban: '<:mod_ban:1362794935887175680>',
  BanHammer: '<:mod_ban_hammer:1362794938016787456>',
  Unban: '<:mod_unban:1362794940146403328>',

  // Kick actions
  Kick: '<:mod_kick:1362794942276019200>',
  Boot: '<:mod_boot:1362794944405635072>',

  // Timeout/Mute actions
  Timeout: '<:mod_timeout:1362794946535250944>',
  Mute: '<:mod_mute:1362794948664866816>',
  Unmute: '<:mod_unmute:1362794950794482688>',
  Deaf: '<:mod_deaf:1362794952924098560>',
  Undeaf: '<:mod_undeaf:1362794955053714432>',

  // Warning actions
  Warn: '<:mod_warn:1362794957183330304>',
  Warning: '<:mod_warning:1362794959312946176>',
  Gavel: '<:mod_gavel:1362794961442562048>',

  // Lock actions
  Lock: '<:mod_lock:1362794963572177920>',
  Unlock: '<:mod_unlock:1362794965701793792>',
  Lockdown: '<:mod_lockdown:1362794967831409664>',

  // Role management
  Role: '<:mod_role:1362794969961025536>',
  Roles: '<:mod_roles:1362794972090641408>',
  AddRole: '<:mod_add_role:1362794974220257272>',
  RemoveRole: '<:mod_remove_role:1362794976349873152>',

  // Channel management
  Channel: '<:mod_channel:1362794978479489024>',
  Channels: '<:mod_channels:1362794980609104896>',
  TextChannel: '<:mod_text_channel:1362794982738720768>',
  VoiceChannel: '<:mod_voice_channel:1362794984868336634>',
  Category: '<:mod_category:1362794986997952512>',

  // Permissions
  Perms: '<:mod_perms:1362794989127568384>',
  PermsDenied: '<:mod_perms_denied:1362794991257184256>',
  PermsAllowed: '<:mod_perms_allowed:1362794993386800128>',

  // Audit and logs
  Audit: '<:mod_audit:1362794995516416000>',
  Log: '<:mod_log:1362794997646031872>',
  Logs: '<:mod_logs:1362794999775647744>',

  // Verification
  Verify: '<:mod_verify:1362795001905263616>',
  Verified: '<:mod_verified:1362795004034879488>',
  Unverified: '<:mod_unverified:1362795006164495360>',

  // Anti-spam
  Spam: '<:mod_spam:1362795008294111232>',
  Filter: '<:mod_filter:1362795010423727104>',
  Shield: '<a:5106verifyblack:1505292863024402592>',
  Security: '<:mod_security:1362795014682958848>',

  // Actions
  Check: '<:mod_check:1362795016812574720>',
  CheckPing: '<a:utility_ping:1504624894053453894>',
  Cross: '<:mod_cross:1362795018942190592>',
  Plus: '<:mod_plus:1362795021071806464>',
  Minus: '<:mod_minus:1362795023201422336>',

  // Purge actions
  Purge: '<:mod_purge:1362795025331038208>',
  Sweep: '<:mod_sweep:1362795027460654072>',
  Clear: '<:mod_clear:1362795029590270720>',

  // Misc
  GavelHammer: '<a:mod_gavel_hammer:1362795031719884800>',
  Scale: '<:mod_scale:1362795033849500672>',
  Badge: '<:mod_badge:1362795035979116544>',
  Sheriff: '<:mod_sheriff:1362795038108732416>',
} as const;

export type ModerationEmoji = typeof Moderation[keyof typeof Moderation];