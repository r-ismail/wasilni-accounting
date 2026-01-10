import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, createConnection } from 'mongoose';

@Injectable()
export class TenantConnectionService {
  private readonly logger = new Logger(TenantConnectionService.name);
  private readonly connections = new Map<string, Connection>();

  constructor(private readonly configService: ConfigService) {}

  async getConnection(dbName: string): Promise<Connection> {
    const existing = this.connections.get(dbName);
    if (existing && existing.readyState === 1) {
      return existing;
    }

    const uri = this.buildMongoUri(dbName);
    const connection = createConnection(uri);
    this.connections.set(dbName, connection);

    connection.on('error', (error) => {
      this.logger.error(`Tenant connection error (${dbName}): ${error}`);
    });

    return connection.asPromise();
  }

  buildMongoUri(dbName: string): string {
    const baseUri =
      this.configService.get<string>('TENANT_BASE_URI') ||
      this.configService.get<string>('MONGODB_URI');
    if (!baseUri) {
      throw new Error('TENANT_BASE_URI or MONGODB_URI is not configured');
    }

    const url = new URL(baseUri);
    url.pathname = `/${dbName}`;
    return url.toString();
  }
}
