import { Logger, Provider, Scope } from '@nestjs/common';
import { Client } from '@unique-nft/substrate-client';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { join } from 'path';
export const SDK_PROVIDER = 'SDK_PROVIDER';

const pkgSDK = JSON.parse(
  fs.readFileSync(
    join(
      process.cwd(),
      'node_modules',
      '@unique-nft',
      'substrate-client',
      'package.json',
    ),
    'utf8',
  ),
);
const waitConnectionReady = async (
  sdk: Client,
  logger: Logger,
  wsEndpoint: string,
): Promise<Client> => {
  sdk.api.on('ready', () => logger.debug(`ready (${wsEndpoint})`));
  sdk.api.on('connected', () => logger.debug(`connected (${wsEndpoint})`));
  sdk.api.on('disconnected', () => logger.warn(`disconnected (${wsEndpoint})`));
  sdk.api.on('error', () => logger.error(`error (${wsEndpoint})`));

  const [chain, version] = await Promise.all([
    sdk.api.rpc.system.chain(),
    sdk.api.rpc.system.version(),
  ]);
  sdk.api.isReady;
  logger.log(`${chain} (${wsEndpoint}) version ${version} - ready`);
  return sdk;
};
export const WssProvider: Provider<Promise<Client>> = {
  provide: SDK_PROVIDER,
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    const logger = new Logger(`SDK ${pkgSDK.version}`, {
      timestamp: true,
    });
    const wsEndpoint = config.get('app.wss');
    const sdk = await Client.create({ chainWsUrl: wsEndpoint });
    await waitConnectionReady(sdk, logger, wsEndpoint);
    return sdk;
  },
  scope: Scope.DEFAULT,
};
