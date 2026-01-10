import { DynamicModule, Module, Scope } from '@nestjs/common';
import { getModelToken, ModelDefinition } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { TENANT_CONNECTION } from './tenant.constants';
import { TenantModule } from './tenant.module';

@Module({})
export class TenantMongooseModule {
  static forFeature(models: ModelDefinition[]): DynamicModule {
    const providers = models.map((model) => ({
      provide: getModelToken(model.name),
      scope: Scope.REQUEST,
      inject: [TENANT_CONNECTION],
      useFactory: async (connection: Connection) => {
        if (connection.models[model.name]) {
          return connection.models[model.name];
        }
        return connection.model(model.name, model.schema);
      },
    }));

    return {
      module: TenantMongooseModule,
      imports: [TenantModule],
      providers,
      exports: providers.map((provider) => provider.provide),
    };
  }
}
