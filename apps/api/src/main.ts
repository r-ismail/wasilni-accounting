import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

let cachedApp: any;

async function setupApp(app: INestApplication) {
  // Use Winston logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Enable CORS
  const defaultOrigins = ['http://localhost:5173', 'https://wasilni-accounting-web.vercel.app'];
  const allowedCorsOrigins = process.env.CORS_ORIGIN
    ? [...defaultOrigins, ...process.env.CORS_ORIGIN.split(',').map(o => o.trim())]
    : defaultOrigins;

  app.enableCors({
    origin: (incomingOrigin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or allowed origins
      if (!incomingOrigin || allowedCorsOrigins.includes(incomingOrigin)) {
        return callback(null, true);
      }
      return callback(
        new Error('CORS policy does not allow access from the specified Origin'),
      );
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Aqarat Accounting API')
    .setDescription('Multi-tenant property management accounting system API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.init();
  return app;
}

async function bootstrap() {
  // For Vercel/Serverless
  if (process.env.VERCEL) {
    if (!cachedApp) {
      const app = await NestFactory.create(AppModule);
      await setupApp(app);
      cachedApp = app.getHttpAdapter().getInstance();
    }
    return cachedApp;
  }

  // For Local/Railway
  const app = await NestFactory.create(AppModule);
  await setupApp(app);
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

// Start local server if not in Vercel environment
if (!process.env.VERCEL) {
  bootstrap();
}

// Export for Vercel
export default async (req: any, res: any) => {
  const app = await bootstrap();
  return app(req, res);
};
