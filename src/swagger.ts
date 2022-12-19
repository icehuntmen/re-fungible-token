import * as fs from 'fs';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export default async function (app: INestApplication) {
  const pkg = JSON.parse(
    fs.readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
  );
  const fileDocumentSecondary = fs
    .readFileSync(join(process.cwd(), 'docs', 'description.md'))
    .toString();
  const description = [fileDocumentSecondary].filter((el) => el).join('\n\n');
  const documentBuild = new DocumentBuilder()
    .setTitle('Create RFT API')
    .setDescription(description)
    .setVersion(`v${pkg.version}`)
    .addTag('Create ReFungible Tokens')
    .build();

  const document = SwaggerModule.createDocument(app, documentBuild, {
    deepScanRoutes: true,
  });

  SwaggerModule.setup('swagger', app, document, {
    explorer: true,
    customSiteTitle: 'ReFungible API',
  });
}
