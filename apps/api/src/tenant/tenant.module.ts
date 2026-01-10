import { Global, Module, Scope } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { CompaniesModule } from '../modules/companies/companies.module';
import { TenantConnectionService } from './tenant-connection.service';
import { TenantContextService } from './tenant-context.service';
import { TENANT_CONNECTION } from './tenant.constants';

@Global()
@Module({
  imports: [ConfigModule, CompaniesModule],
  providers: [
    TenantConnectionService,
    TenantContextService,
    {
      provide: TENANT_CONNECTION,
      scope: Scope.REQUEST,
      inject: [REQUEST, TenantConnectionService, TenantContextService],
      useFactory: async (_req: unknown, connectionService: TenantConnectionService, context: TenantContextService) => {
        const dbName = await context.getTenantDbName();
        return connectionService.getConnection(dbName);
      },
    },
  ],
  exports: [TENANT_CONNECTION, TenantConnectionService, TenantContextService],
})
export class TenantModule {}
