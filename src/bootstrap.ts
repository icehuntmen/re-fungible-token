import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/api/app.module';
import { version } from '../package.json';
import { green, yellow } from 'cli-color';
import { ConfigService } from '@nestjs/config';
import { useContainer } from 'class-validator';
import swaggerInit from '@app/api/swagger';

export default async function (app: INestApplication, logger: Logger) {
  app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  // Start app
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.enableShutdownHooks();
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  //Swagger
  await swaggerInit(app);

  // Listener port
  const configService = app.get(ConfigService);
  await app.listen(configService.get('app.port'), () => {
    logger.log(
      `API application on port: ${yellow(configService.get('app.port'))}`,
    );
    logger.log(
      `API application ${green('version:')} ${yellow(version)} ${green(
        'started!',
      )}`,
    );
  });
  return app;
}
