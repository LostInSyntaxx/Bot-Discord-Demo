/**
 * Utility Emojis - Nitro-style utility and info icons
 * Premium dashboard-style icons
 * Replace emoji IDs with your server's custom emoji IDs
 */

export const Utility = {
  // Search and navigation
  Search: '<:utility_search:1362794795308478555>',
  Filter: '<:utility_filter:1362794797410385980>',
  Sort: '<:utility_sort:1362794799530717245>',
  Refresh: '<a:utility_refresh:1362794801674264626>',

  // Settings and config
  Settings: '<a:5666settings:1505293953929445377>',
  Config: '<:utility_config:1362794805937776700>',
  Gear: '<a:utility_gear:1362794808082235420>',
  Tools: '<:utility_tools:1362794810218700800>',

  // Information
  Info: '<a:38899greenloading:1504642766804877372>',
  Help: '<a:38899greenloading:1504642766804877372>',
  Question: '<:utility_question:1362794816615948288>',
  Book: '<:utility_book:1362794818744274954>',

  // User and member
  User: '<:utility_user:1362794820874364928>',
  Users: '<:utility_users:1362794823003004928>',
  Profile: '<:utility_profile:1362794825131648000>',
  Avatar: '<:utility_avatar:1362794827260284928>',
  Member: '<:utility_member:1362794829393952768>',

  // Server and guild
  Server: '<:serversolid:1505288295897235466>',
  Guild: '<:utility_guild:1362794833653846016>',
  Crown: '<a:47232crowngreen:1505290790992085010>',
  Shield: '<a:5106verifyblack:1505292863024402592>',
  ShieldCheck: '<:utility_shield_check:1362794840043085824>',

  // Time and date
  Clock: '<a:utility_clock:1504625821908861118>',
  Calendar: '<a:99609calendar:1505289393177628672>',
  Timer: '<a:utility_timer:1362794846430433280>',
  Stopwatch: '<a:utility_stopwatch:1362794848564252672>',

  // Stats and analytics
  Stats: '<a:38899greenloading:1504642766804877372>',
  Chart: '<:utility_chart:1362794852822785024>',
  Graph: '<:utility_graph:1362794854952400896>',
  Bars: '<:utility_bars:1362794857082015744>',

  // Media
  Photo: '<:utility_photo:1362794861341247488>',
  Camera: '<:utility_camera:1362794863470863360>',
  Video: '<:utility_video:1362794865600275456>',
  Play: '<:utility_play:1362794867729887232>',
  Pause: '<:utility_pause:1362794869859503104>',

  // Messaging
  Message: '<:utility_message:1362794871989112832>',
  Messages: '<:utility_messages:1362794874118728704>',
  Chat: '<:utility_chat:1362794876248344576>',
  Comment: '<:utility_comment:1362794878377759744>',
  Pencil: '<:utility_pencil:1362794880507375616>',

  // Code and technical
  Code: '<:utility_code:1362794882636991488>',
  Terminal: '<:utility_terminal:1362794884766607360>',
  Brackets: '<:utility_brackets:1362794886896021504>',
  Bug: '<:utility_bug:1362794889025636352>',

  // Star and favorites
  StarFilled: '<:utility_star_filled:1362794893284866048>',
  Heart: '<:utility_heart:1362794895414480896>',
  HeartFilled: '<:utility_heart_filled:1362794897544095744>',

  // Links and files
  Link: '<:utility_link:1362794899673711616>',
  Attachment: '<:utility_attachment:1362794901803327488>',
  File: '<:utility_file:1362794903932943360>',
  Folder: '<:utility_folder:1362794906062559232>',
  Download: '<:utility_download:1362794908192175104>',
  Upload: '<:utility_upload:1362794910321790976>',

  // Ping and network
  Ping: '<a:utility_ping:1504624894053453894>',
  Wifi: '<:utility_wifi:1362794914581022720>',
  Signal: '<:utility_signal:1362794916710638592>',

  // Misc
  Pin: '<:utility_pin:1362794918840254464>',
  Flag: '<:utility_flag:1362794920969870336>',
  Bookmark: '<:utility_bookmark:1362794923099486208>',
  Tag: '<:utility_tag:1362794925229102074>',
  Bell: '<:utility_bell:1362794927358717952>',
  BellSlash: '<:utility_bell_slash:1362794929488333824>',
  Trash: '<:utility_trash:1362794931617949696>',
  Edit: '<:utility_edit:1362794933747565568>',
} as const;

export type UtilityEmoji = typeof Utility[keyof typeof Utility];