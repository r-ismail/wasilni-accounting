import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { BuildingsModule } from './modules/buildings/buildings.module';
import { UnitsModule } from './modules/units/units.module';
import { ServicesModule } from './modules/services/services.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { MetersModule } from './modules/meters/meters.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { BackupsModule } from './modules/backups/backups.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Scheduler
    ScheduleModule.forRoot(),

    // Winston Logger
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf((info: any) => {
              const { timestamp, level, message, context } = info;
              return `${timestamp} [${context || 'App'}] ${level}: ${message}`;
            }),
          ),
        } as any),
        ...(process.env.NODE_ENV !== 'production' && !process.env.VERCEL
          ? [
            new winston.transports.File({
              filename: 'logs/error.log',
              level: 'error',
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
              ),
            } as any),
            new winston.transports.File({
              filename: 'logs/combined.log',
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
              ),
            } as any),
          ]
          : []),
      ],
    }),

    // MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri:
          configService.get<string>('CONTROL_MONGODB_URI') ||
          configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    CompaniesModule,
    BuildingsModule,
    UnitsModule,
    ServicesModule,
    CustomersModule,
    ContractsModule,
    InvoicesModule,
    MetersModule,
    PaymentsModule,
    NotificationsModule,
    ReportsModule,
    VendorsModule,
    ExpensesModule,
    BackupsModule,
    OnboardingModule,
  ],
})
export class AppModule { }
