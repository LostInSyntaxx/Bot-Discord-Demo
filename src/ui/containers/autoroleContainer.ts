import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  Role,
} from 'discord.js';
import { Emoji } from '@config/emoji';

export function createAutoRoleListContainer(roles: Role[]): ContainerBuilder {
  const roleList = roles.length > 0
    ? roles.map(r => `${Emoji.Check} <@&${r.id}>`).join('\n')
    : `${Emoji.Warning} No auto roles configured`;

  return new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`# ${Emoji.Shield} Auto Role\nRoles assigned automatically when a member joins`)
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**Configured Roles**\n${roleList}`)
    );
}

export function createAutoRoleSuccessContainer(action: 'add' | 'remove', roleName: string): ContainerBuilder {
  const isAdd = action === 'add';
  return new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(
          `${isAdd ? Emoji.Success : Emoji.Error} **Auto Role ${isAdd ? 'Added' : 'Removed'}**\n` +
          `Role **${roleName}** has been ${isAdd ? 'added to' : 'removed from'} the auto role list`
        )
    );
}
