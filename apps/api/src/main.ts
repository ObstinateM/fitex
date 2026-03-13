import './env.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.enableCors({
    origin: [
      'http://localhost:3000',
      /^chrome-extension:\/\//,
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
