import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
} from 'discord.js';
import { Emoji } from '@config/emoji';

/**
 * Verification interface for users to verify their identity.
 */
export function createVerifyContainer(botName: string, verifiedCount: number): {
  container: ContainerBuilder;
  row: ActionRowBuilder<ButtonBuilder>
} {
  const container = new ContainerBuilder();

  // 1. Author/Category Header
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`-# VERIFICATION`)
  );

  // 2. Title
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`# ยืนยันตัวตนเพื่อเข้าสู่เซิร์ฟเวอร์`)
  );

  // 3. Description
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`ยินดีต้อนรับเข้าสู่เซิร์ฟเวอร์ของเรา! กรุณายืนยันตัวตนเพื่อเข้าถึงช่องแชทหลัก`)
  );

  // 4. Large Visual Asset (Anime Girl)
  container.addMediaGalleryComponents(
    new MediaGalleryBuilder().addItems(
      new MediaGalleryItemBuilder().setURL('https://i.pinimg.com/736x/36/d5/fd/36d5fd4baf95540b2ba2b633c49b1713.jpg'),
    )
  );

  // 5. Footer Metadata
  const timestamp = `<t:${Math.floor(Date.now() / 1000)}:f>`;

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`-# ${botName} • ${timestamp} • ${Emoji.User} **Verified:** ${verifiedCount.toLocaleString()}`)
  );

  // 6. Verification Button
  const button = new ButtonBuilder()
    .setCustomId('verify')
    .setLabel(`VERIFY • ${verifiedCount.toLocaleString()}`)
    .setStyle(ButtonStyle.Secondary)
    .setEmoji(Emoji.SuccessVerify);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

  return { container, row };
}

/**
 * Admin configuration feedback for setting up verification.
 */
export function createVerifySetupContainer(roleId: string, channelId: string): ContainerBuilder {
  return new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${Emoji.Settings} ระบบยืนยันตัวตน — ตั้งค่าสำเร็จ`)
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `> ${Emoji.Success} **สถานะ:** เปิดใช้งานและพร้อมตรวจสอบ\n` +
        `> ${Emoji.User} **ยศเป้าหมาย:** <@&${roleId}>\n` +
        `> ${Emoji.Server} **ห้องที่ติดตั้ง:** <#${channelId}>`
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# ${Emoji.Info} *อินเทอร์เฟซการยืนยันตัวตนถูกส่งไปยังห้องที่กำหนดแล้ว*`
      )
    );
}
