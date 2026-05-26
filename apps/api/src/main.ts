import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  // CORS — same-origin via nginx em produção, mas mantém abertura para dev local
  app.enableCors({ origin: true, credentials: true });
  const port = Number(process.env.API_PORT) || 3011;
  await app.listen(port, '0.0.0.0');
  console.log(`api listening on :${port}`);
}
bootstrap();
