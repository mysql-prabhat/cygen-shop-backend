// main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config'; // <-- Import ConfigService
process.env['NODE_DEBUG'] = 'passport';
import passport from 'passport';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(passport.initialize());
  // 1. Get the ConfigService instance from the application context
  const configService = app.get(ConfigService);
  
  // 2. Use the ConfigService to safely retrieve the PORT
  const port = configService.get<number>('PORT', 4000); // Default to 4000

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // ... (rest of your app.use setup)
  app.enableCors({
    origin: true,
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  console.log(`🚀 Server running on port ${port}`);
  await app.listen(port);
}
bootstrap().catch((error) => {
  throw error;
});