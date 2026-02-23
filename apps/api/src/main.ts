import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

let cachedApp: any;

async function setupApp(app: INestApplication) {
  // We remove the global 'api' prefix to allow both /api/path and /path 
  // depending on the Vercel routing, and to match the user's frontend requests.
  // app.setGlobalPrefix('api'); 

  // Enable CORS with broad support for Vercel environments
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
      if (!origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        /localhost:\d+$/.test(origin)) {
        callback(null, true);
      } else {
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
    try {
      const app = await NestFactory.create(AppModule);
      await setupApp(app);
      cachedApp = app.getHttpAdapter().getInstance();
    } catch (err) {
      console.error('NestJS Bootstrap Error:', err);
      throw err;
    }
  }
  return cachedApp;
}

// Export for Vercel
export default async (req: any, res: any) => {
  // Standard CORS for health checks
  const origin = req.headers.origin;
  if (origin && (origin.endsWith('.vercel.app') || origin.includes('localhost'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, x-tenant-id');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Support health checks at various common paths
  const normalizedUrl = req.url.split('?')[0];
  if (['/api/health', '/health', '/api', '/'].includes(normalizedUrl)) {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Wasilni Accounting API is running'
    });
  }

  try {
    const app = await bootstrap();
    // Vercel routes sometimes pass /api/auth/login, NestJS should receive it
    // If NestJS doesn't have a prefix, it will look for a controller at /api/auth
    // To fix this, we can strip /api if it exists before passing to NestJS
    if (req.url.startsWith('/api/')) {
      req.url = req.url.replace('/api/', '/');
    }

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
if (!process.env.VERCEL) {
  (async () => {
    const app = await NestFactory.create(AppModule);
    await setupApp(app);
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
  })();
}
