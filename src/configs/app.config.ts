import { registerAs } from '@nestjs/config';
import { version } from 'package.json';

export default registerAs(
  'app',
  (): Record<string, any> => ({
    port: parseInt(process.env.API_PORT) || 5000,
    wss: process.env.CHAIN_URL,
    seed: process.env.SEED,
    transferToSeed: process.env.TRANSFER_TO_SEED,
    createCollection: true,
    collectionId: parseInt(process.env.COLLECTION_ID),
    amountToTransfer: parseInt(process.env.AMOUNT_TO_TRANSFER) || 10,
    amountOfTokensToCreate: parseInt(process.env.AMOUNT_TOKEN_CREATE) || 0,
    amountOfFractions: parseInt(process.env.AMOUNT_FRACTION) || 100,
    repoVersion: process.env.API_VERSION || version,
    swaggerPrefix: process.env.SWAGGER_PREFIX || 'api',
  }),
);
