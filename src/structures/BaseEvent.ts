import { Event, EventOptions } from '@bot-types/Event';

export abstract class BaseEvent implements Event {
  public options: EventOptions;

  constructor(options: EventOptions) {
    this.options = {
      once: false,
      enabled: true,
      ...options,
    };
  }

  abstract execute(...args: any[]): Promise<void>;
}
