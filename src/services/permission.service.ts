import { GuildMember, PermissionResolvable } from 'discord.js';
import { ExtendedClient } from '@bot-types/Client';
import { BaseService } from '@structures/BaseService';
import { env } from '@config/env';

export class PermissionService extends BaseService {
  private ownerIds: Set<string>;

  constructor(client: ExtendedClient) {
    super(client);
    this.ownerIds = new Set();
    
    if (env.BOT_OWNER_ID) {
      this.ownerIds.add(env.BOT_OWNER_ID);
    }
  }

  async initialize(): Promise<void> {
    // Load owner IDs from config or database
  }

  async shutdown(): Promise<void> {
    this.ownerIds.clear();
  }

  isOwner(userId: string): boolean {
    return this.ownerIds.has(userId);
  }

  addOwner(userId: string): void {
    this.ownerIds.add(userId);
  }

  removeOwner(userId: string): void {
    this.ownerIds.delete(userId);
  }

  hasPermission(member: GuildMember, permission: PermissionResolvable): boolean {
    if (this.isOwner(member.id)) return true;
    if (member.permissions.has('Administrator')) return true;
    return member.permissions.has(permission);
  }

  hasAnyPermission(member: GuildMember, permissions: PermissionResolvable[]): boolean {
    if (this.isOwner(member.id)) return true;
    if (member.permissions.has('Administrator')) return true;
    return permissions.some((perm) => member.permissions.has(perm));
  }

  hasAllPermissions(member: GuildMember, permissions: PermissionResolvable[]): boolean {
    if (this.isOwner(member.id)) return true;
    if (member.permissions.has('Administrator')) return true;
    return permissions.every((perm) => member.permissions.has(perm));
  }

  canManageMember(executor: GuildMember, target: GuildMember): boolean {
    if (this.isOwner(executor.id)) return true;
    if (executor.id === target.guild.ownerId) return true;
    if (target.id === target.guild.ownerId) return false;
    
    return executor.roles.highest.position > target.roles.highest.position;
  }

  getMissingPermissions(member: GuildMember, required: PermissionResolvable[]): PermissionResolvable[] {
    if (this.isOwner(member.id)) return [];
    if (member.permissions.has('Administrator')) return [];
    
    return required.filter((perm) => !member.permissions.has(perm));
  }
}
