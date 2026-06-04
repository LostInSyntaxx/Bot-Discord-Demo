import { ExtendedClient } from '@bot-types/Client';

export abstract class BaseService {
  protected client: ExtendedClient;

  constructor(client: ExtendedClient) {
    this.client = client;
  }

  abstract initialize(): Promise<void>;
  abstract shutdown(): Promise<void>;
}
