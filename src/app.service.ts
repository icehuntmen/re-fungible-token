import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from '@unique-nft/substrate-client';
import { ConfigService } from '@nestjs/config';
import { KeyringProvider } from '@unique-nft/accounts/keyring';
import { Account } from '@unique-nft/accounts';
import { HelperService } from '@app/api/helpers/helper.service';
import { KeyringPair } from '@polkadot/keyring/types';
import { TypeCreation } from '@app/api/app.controller';

@Injectable()
export class AppService implements OnModuleInit {
  private signer: Account<KeyringPair>;
  private ownerToken: Account<KeyringPair>;
  private collectionId: number;
  constructor(
    private config: ConfigService,
    private helper: HelperService,
    @Inject('SDK_PROVIDER') private sdk: Client,
  ) {}

  async onModuleInit(): Promise<void> {
    const provider = new KeyringProvider({ type: 'sr25519' });
    await provider.init();
    /** Owner collection */
    this.signer = provider.addSeed(this.config.get('app.seed'));
    /** Account to transfer part of the token to */
    this.ownerToken = provider.addSeed(this.config.get('app.seed'));
    /** Collection ID */
    this.collectionId = parseInt(this.config.get('app.collectionId'));
    if (isNaN(this.collectionId) || this.collectionId === undefined) {
      const address = this.signer.instance.address;
      console.log(address);
      // await this.creationCollectionRFT(address);
    }
  }

  async createCollection(newCollection: TypeCreation): Promise<any> {
    let collection;
    if (newCollection === 'true') {
      const address = this.signer.instance.address;
      collection = await this.creationCollectionRFT(address);
    }
    return (
      collection || {
        id: this.collectionId,
        collection: await this.getCollection(),
      }
    );
  }

  async creationCollectionRFT(
    address: string,
    name = 'RFT test',
    description = 'Testing collection',
    tokenPrefix = 'TRFT',
  ): Promise<number> {
    const signer = this.signer.getSigner();
    console.log(signer);
    const schema = {
      schemaName: 'unique', // please don't touch
      schemaVersion: '1.0.0',
      // collection image
      coverPicture: {
        url: 'https://ipfs.uniquenetwork.dev/ipfs/QmUpNzjmAnnrrYgtLeWC6UEPaH2c37nzuhiU6UiwYq5pSW',
      },
      image: {
        urlTemplate: '{infix}',
      },
      attributesSchemaVersion: '1.0.0',
      attributesSchema: {
        0: {
          name: { _: 'First' },
          type: 'string',
          isArray: false,
          optional: false,
        },
        1: {
          name: { _: 'Second' },
          type: 'string',
          isArray: false,
          optional: false,
        },
      },
      // If used as is in params - it works. As variable - type error
    } as unknown as any; // TODO: no idea, it doesn't like type being "string" and want it to be "string".
    const result = (await this.sdk.refungible.createCollection.submitWaitResult(
      {
        address,
        description,
        name,
        tokenPrefix,
        schema,
      },
      { signer },
    )) as any;

    console.log(JSON.stringify(result));
    await this.helper.updateEnv('COLLECTION_ID', result?.parsed?.collectionId);
    if (!result?.parsed?.collectionId)
      throw new Error(`Result doesn't contain collectionId: ${result}}`);
    return result?.parsed?.collectionId;
  }

  async getCollection(): Promise<any> {
    return await this.sdk.refungible.getCollection({
      collectionId: this.collectionId,
    });
  }

  async createToken(
    address: string,
    collectionId: number,
    amount = 10,
    first = 'Default',
    second = 'Default 2',
  ): Promise<number> {
    const signer = this.signer.getSigner();
    const data = {
      image: {
        url: `https://ipfs.uniquenetwork.dev/ipfs/QmUpNzjmAnnrrYgtLeWC6UEPaH2c37nzuhiU6UiwYq5pSW`,
      },
      // make sure to follow the schema from collection. Order matters
      encodedAttributes: {
        0: {
          _: `Name: ${first}`,
        },
        1: {
          _: `Second name ${second}`,
        },
      },
    };
    const result = await this.sdk.refungible.createToken.submitWaitResult(
      {
        collectionId,
        address,
        data,
        amount,
      },
      { signer },
    );
    if (!result.parsed?.tokenId)
      throw new Error(`Created token doesn't have id: ${result}`);
    return result.parsed.tokenId;
  }

  async createRFToken(amount: number): Promise<any> {
    const address = this.signer.instance.address;
    return await this.createToken(address, this.collectionId);
  }
}
