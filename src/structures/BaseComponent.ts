import { Component, ComponentOptions } from '@bot-types/Component';

export abstract class BaseComponent implements Component {
  public options: ComponentOptions;

  constructor(options: ComponentOptions) {
    this.options = {
      ownerOnly: false,
      timeout: 300000, // 5 minutes default
      ...options,
    };
  }

  abstract execute(...args: any[]): Promise<void>;
}
