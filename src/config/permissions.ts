import { PermissionFlagsBits, PermissionResolvable } from 'discord.js';

export const PermissionMap = {
  // Administrator
  ADMINISTRATOR: PermissionFlagsBits.Administrator,
  
  // General
  VIEW_CHANNEL: PermissionFlagsBits.ViewChannel,
  MANAGE_CHANNELS: PermissionFlagsBits.ManageChannels,
  MANAGE_GUILD: PermissionFlagsBits.ManageGuild,
  VIEW_AUDIT_LOG: PermissionFlagsBits.ViewAuditLog,
  MANAGE_WEBHOOKS: PermissionFlagsBits.ManageWebhooks,
  MANAGE_EMOJIS: PermissionFlagsBits.ManageGuildExpressions,
  
  // Membership
  CREATE_INVITE: PermissionFlagsBits.CreateInstantInvite,
  CHANGE_NICKNAME: PermissionFlagsBits.ChangeNickname,
  MANAGE_NICKNAMES: PermissionFlagsBits.ManageNicknames,
  KICK_MEMBERS: PermissionFlagsBits.KickMembers,
  BAN_MEMBERS: PermissionFlagsBits.BanMembers,
  MODERATE_MEMBERS: PermissionFlagsBits.ModerateMembers,
  
  // Text Channels
  SEND_MESSAGES: PermissionFlagsBits.SendMessages,
  SEND_TTS_MESSAGES: PermissionFlagsBits.SendTTSMessages,
  MANAGE_MESSAGES: PermissionFlagsBits.ManageMessages,
  EMBED_LINKS: PermissionFlagsBits.EmbedLinks,
  ATTACH_FILES: PermissionFlagsBits.AttachFiles,
  READ_MESSAGE_HISTORY: PermissionFlagsBits.ReadMessageHistory,
  MENTION_EVERYONE: PermissionFlagsBits.MentionEveryone,
  USE_EXTERNAL_EMOJIS: PermissionFlagsBits.UseExternalEmojis,
  ADD_REACTIONS: PermissionFlagsBits.AddReactions,
  USE_SLASH_COMMANDS: PermissionFlagsBits.UseApplicationCommands,
  MANAGE_THREADS: PermissionFlagsBits.ManageThreads,
  CREATE_PUBLIC_THREADS: PermissionFlagsBits.CreatePublicThreads,
  CREATE_PRIVATE_THREADS: PermissionFlagsBits.CreatePrivateThreads,
  
  // Voice Channels
  CONNECT: PermissionFlagsBits.Connect,
  SPEAK: PermissionFlagsBits.Speak,
  MUTE_MEMBERS: PermissionFlagsBits.MuteMembers,
  DEAFEN_MEMBERS: PermissionFlagsBits.DeafenMembers,
  MOVE_MEMBERS: PermissionFlagsBits.MoveMembers,
  USE_VAD: PermissionFlagsBits.UseVAD,
  
  // Roles
  MANAGE_ROLES: PermissionFlagsBits.ManageRoles,
} as const;

export type PermissionName = keyof typeof PermissionMap;

export function hasPermission(
  userPermissions: bigint,
  requiredPermission: PermissionResolvable
): boolean {
  const permission = BigInt(requiredPermission as any);
  return (userPermissions & permission) === permission;
}

export function hasAnyPermission(
  userPermissions: bigint,
  requiredPermissions: PermissionResolvable[]
): boolean {
  return requiredPermissions.some((perm) => hasPermission(userPermissions, perm));
}

export function hasAllPermissions(
  userPermissions: bigint,
  requiredPermissions: PermissionResolvable[]
): boolean {
  return requiredPermissions.every((perm) => hasPermission(userPermissions, perm));
}
