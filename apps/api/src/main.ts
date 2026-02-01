import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

let cachedApp: any;

async function setupApp(app: INestApplication) {
  // Set global prefix
  app.setGlobalPrefix('api');

  // Enable CORS with broad support for Vercel preview environments
  const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://wasilni-accounting-web.vercel.app',
    'https://wasilni-accounting-api.vercel.app'
  ];

  const envOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : [];

  const allowedOrigins = [...defaultOrigins, ...envOrigins];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow if no origin (like mobile apps or curl) or matched
      if (!origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        /localhost:\d+$/.test(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked for origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'x-tenant-id'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
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
      const app = await NestFactory.create(AppModule);
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

// Export for Vercel
export default async (req: any, res: any) => {
  // Manual CORS for the health check and initial requests
  const origin = req.headers.origin;
  if (origin && (origin.endsWith('.vercel.app') || origin.includes('localhost'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, x-tenant-id');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // Handle OPTIONS preflight manually to ensure it always succeeds
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.url === '/api/health' || req.url === '/health') {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL
    });
  }

  try {
    const app = await bootstrap();
    return app(req, res);
  } catch (err) {
    console.error('Vercel Invoke Error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

// Local development server
if (!process.env.VERCEL && require.main === module) {
  (async () => {
    const app = await NestFactory.create(AppModule);
    await setupApp(app);
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
  })();
}
