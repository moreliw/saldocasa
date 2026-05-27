import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false, // controlamos os parsers manualmente pra preservar raw body do webhook
  });
  app.setGlobalPrefix('api');
  app.use(cookieParser());

  // Webhook do Stripe: preserva o buffer cru pra validar assinatura
  app.use('/api/billing/webhook', bodyParser.raw({ type: 'application/json' }), (req: any, _res: any, next: any) => {
    req.rawBody = req.body;
    next();
  });
  // Demais rotas: JSON normal
  app.use(bodyParser.json({ limit: '1mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableCors({ origin: true, credentials: true });
  const port = Number(process.env.API_PORT) || 3011;
  await app.listen(port, '0.0.0.0');
  console.log(`api listening on :${port}`);
}
bootstrap();
