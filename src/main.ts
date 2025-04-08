import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  //https://docs.nestjs.com/openapi/introduction
  const config = new DocumentBuilder()
    .setTitle('API pour MoovieBooker')
    .setDescription(
      '<a href="https://github.com/julienESN/MovieBooker" target="_blank">Lien vers le repo Git </a>',
    )
    .setExternalDoc('Doc utilisé (NestJs):', 'https://docs.nestjs.com/')

    .setContact('Julien', 'https://jesn.fr', 'julien.esnau@gmail.com')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
