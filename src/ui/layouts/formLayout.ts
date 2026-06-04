import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export interface FormField {
  customId: string;
  label: string;
  style: TextInputStyle;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  value?: string;
}

export interface FormLayoutOptions {
  customId: string;
  title: string;
  fields: FormField[];
}

export function createFormLayout(options: FormLayoutOptions): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId(options.customId)
    .setTitle(options.title);

  for (const field of options.fields) {
    const textInput = new TextInputBuilder()
      .setCustomId(field.customId)
      .setLabel(field.label)
      .setStyle(field.style)
      .setRequired(field.required ?? true);

    if (field.placeholder) textInput.setPlaceholder(field.placeholder);
    if (field.minLength) textInput.setMinLength(field.minLength);
    if (field.maxLength) textInput.setMaxLength(field.maxLength);
    if (field.value) textInput.setValue(field.value);

    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);
    modal.addComponents(actionRow);
  }

  return modal;
}
