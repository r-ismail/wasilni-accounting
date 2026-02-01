import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, createConnection } from 'mongoose';

@Injectable()
export class TenantConnectionService {
  private readonly logger = new Logger(TenantConnectionService.name);
  private readonly connections = new Map<string, Connection>();

  constructor(private readonly configService: ConfigService) { }

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

    // Safer handling for MongoDB URIs (including srv)
    try {
      if (baseUri.includes('?')) {
        const [urlPart, queryPart] = baseUri.split('?');
        const lastSlashIndex = urlPart.lastIndexOf('/');
        // If it looks like mongodb://host/dbname?query
        if (lastSlashIndex > urlPart.indexOf('://') + 3) {
          const prefix = urlPart.substring(0, lastSlashIndex);
          return `${prefix}/${dbName}?${queryPart}`;
        }
        return `${urlPart}/${dbName}?${queryPart}`;
      } else {
        const lastSlashIndex = baseUri.lastIndexOf('/');
        if (lastSlashIndex > baseUri.indexOf('://') + 3) {
          const prefix = baseUri.substring(0, lastSlashIndex);
          return `${prefix}/${dbName}`;
        }
        return `${baseUri}/${dbName}`;
      }
    } catch (e) {
      this.logger.error(`Error building Mongo URI for ${dbName}: ${e.message}`);
      // Fallback to simple append
      return `${baseUri.replace(/\/$/, '')}/${dbName}`;
    }
  }
}
