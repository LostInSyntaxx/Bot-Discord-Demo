import { ExtendedClient } from '@bot-types/Client';
import { BaseEvent } from '@structures/BaseEvent';

export default new (class ErrorEvent extends BaseEvent {
  constructor() {
    super({
      name: 'error',
    });
  }

  async execute(client: ExtendedClient, error: Error): Promise<void> {
    console.error('❌ Discord client error:', error);
  }
})();
