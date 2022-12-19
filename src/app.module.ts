import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from '@app/api/app.controller';
import { AppService } from '@app/api/app.service';
import configs from '@app/api/configs';
import { UniqueSdkModule } from '@app/api/sdk/sdk.module';
import { HelperService } from '@app/api/helpers/helper.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: configs,
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      expandVariables: true,
    }),
    UniqueSdkModule,
  ],
  controllers: [AppController],
  providers: [AppService, HelperService],
})
export class AppModule {}
