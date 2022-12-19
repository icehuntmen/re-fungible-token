import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { SDK_PROVIDER, WssProvider } from '@app/api/sdk/sdk.provider';
import { Client } from '@unique-nft/substrate-client';

@Global()
@Module({
  imports: [],
  providers: [WssProvider],
  exports: [WssProvider],
})
export class UniqueSdkModule implements OnApplicationShutdown {
  constructor(@Inject(SDK_PROVIDER) private readonly unique: Client) {}
  onApplicationShutdown() {
    this.unique.api.disconnect();
  }
}
