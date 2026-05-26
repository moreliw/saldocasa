import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: true, credentials: true });
  const port = Number(process.env.API_PORT) || 3011;
  await app.listen(port, '0.0.0.0');
  console.log(`api listening on :${port}`);
}
bootstrap();
