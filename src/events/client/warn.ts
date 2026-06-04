import { ExtendedClient } from '@bot-types/Client';
import { BaseEvent } from '@structures/BaseEvent';

export default new (class WarnEvent extends BaseEvent {
  constructor() {
    super({
      name: 'warn',
    });
  }

  async execute(client: ExtendedClient, warning: string): Promise<void> {
    console.warn('⚠️  Discord client warning:', warning);
  }
})();
