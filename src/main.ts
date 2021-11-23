import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //config swagger 
  const config = new DocumentBuilder()
    .setTitle('Fooder API Docs')
    .setDescription('The Fooder client and admin API ')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Fooder')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`http://localhost:${port}/api-docs`);
}
bootstrap();
