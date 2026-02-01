import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston';

let cachedApp: any;

async function setupApp(app: INestApplication) {
  // Use Winston logger
  try {
    const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
    app.useLogger(logger);
  } catch (e) {
    console.error('Failed to set Winston logger:', e);
  }

  // Enable CORS
  const defaultOrigins = ['http://localhost:5173', 'https://wasilni-accounting-web.vercel.app'];
  const allowedCorsOrigins = process.env.CORS_ORIGIN
    ? [...defaultOrigins, ...process.env.CORS_ORIGIN.split(',').map(o => o.trim())]
    : defaultOrigins;

  app.enableCors({
    origin: (incomingOrigin, callback) => {
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
  if (!cachedApp) {
    console.log('Bootstrapping NestJS application...');
    try {
      const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug'], // Basic console logger for bootstrap phase
      });
      await setupApp(app);
      cachedApp = app.getHttpAdapter().getInstance();
      console.log('NestJS application bootstrapped successfully.');
    } catch (err) {
      console.error('NestJS Bootstrap Error:', err);
      throw err;
    }
  }
  return cachedApp;
}

// For Local/Railway development
if (!process.env.VERCEL) {
  (async () => {
    try {
      const app = await NestFactory.create(AppModule);
      await setupApp(app);
      const port = process.env.PORT || 3001;
      await app.listen(port);
      console.log(`Application is running on: http://localhost:${port}`);
    } catch (err) {
      console.error('Local bootstrap failed:', err);
    }
  })();
}

// Export for Vercel
export default async (req: any, res: any) => {
  if (req.url === '/api/health') {
    return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  }

  try {
    const app = await bootstrap();
    return app(req, res);
  } catch (err) {
    console.error('Vercel Invoke Error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
};
