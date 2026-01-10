import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { CompaniesService } from '../companies/companies.service';
import { TenantConnectionService } from '../../tenant/tenant-connection.service';

export interface BackupInfo {
  filename: string;
  path: string;
  sizeBytes: number;
  createdAt: string;
  modifiedAt: string;
}

@Injectable()
export class BackupsService {
  private readonly logger = new Logger(BackupsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly companiesService: CompaniesService,
    private readonly tenantConnectionService: TenantConnectionService,
  ) { }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyBackup() {
    const enabled = this.getEnv('BACKUP_ENABLED', 'true').toLowerCase() !== 'false';
    if (!enabled) {
      return;
    }
    try {
      const companies = await this.companiesService.findAll();
      for (const company of companies) {
        try {
          await this.createBackup(company._id.toString(), 'scheduled');
        } catch (error) {
          this.logger.error(
            `Scheduled backup failed for ${company._id}: ${this.getErrorMessage(error)}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Scheduled backup failed: ${this.getErrorMessage(error)}`);
    }
  }

  async listBackups(companyId: string): Promise<BackupInfo[]> {
    const dbName = await this.companiesService.getCompanyDbName(companyId);
    const backupDir = this.ensureBackupDir(dbName);
    const entries = await fs.promises.readdir(backupDir);
    const backups = await Promise.all(
      entries
        .filter((name) => name.endsWith('.gz'))
        .map(async (name) => {
          const fullPath = path.join(backupDir, name);
          const stat = await fs.promises.stat(fullPath);
          return {
            filename: name,
            path: fullPath,
            sizeBytes: stat.size,
            createdAt: stat.birthtime.toISOString(),
            modifiedAt: stat.mtime.toISOString(),
          };
        }),
    );

    return backups.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
  }

  async createBackup(companyId: string, source: 'manual' | 'scheduled'): Promise<BackupInfo> {
    const dbName = await this.companiesService.getCompanyDbName(companyId);
    const backupDir = this.ensureBackupDir(dbName);
    const uri = this.tenantConnectionService.buildMongoUri(dbName);
    const timestamp = this.formatTimestamp(new Date());
    const filename = `backup-${timestamp}.gz`;
    const filePath = path.join(backupDir, filename);

    this.logger.log(`Creating ${source} backup: ${filePath}`);

    await this.runCommand('mongodump', [
      '--uri',
      uri,
      `--archive=${filePath}`,
      '--gzip',
    ]);

    await this.cleanupOldBackups(backupDir);
    const stat = await fs.promises.stat(filePath);

    return {
      filename,
      path: filePath,
      sizeBytes: stat.size,
      createdAt: stat.birthtime.toISOString(),
      modifiedAt: stat.mtime.toISOString(),
    };
  }

  async restoreBackup(companyId: string, filename: string, targetDbName: string) {
    const dbName = await this.companiesService.getCompanyDbName(companyId);
    const backupDir = this.ensureBackupDir(dbName);
    const filePath = path.join(backupDir, filename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Backup not found: ${filename}`);
    }

    const sourceDb = dbName;
    const uri = this.tenantConnectionService.buildMongoUri(targetDbName);

    this.logger.log(`Restoring backup ${filename} to ${targetDbName}`);

    await this.runCommand('mongorestore', [
      '--uri',
      uri,
      `--archive=${filePath}`,
      '--gzip',
      '--drop',
      `--nsFrom=${sourceDb}.*`,
      `--nsTo=${targetDbName}.*`,
    ]);

    return {
      sourceDb,
      targetDbName,
      filename,
    };
  }

  private ensureBackupDir(dbName: string) {
    const configuredDir = this.getEnv('BACKUP_DIR', 'backups');
    const resolvedDir = path.resolve(process.cwd(), configuredDir, dbName);
    fs.mkdirSync(resolvedDir, { recursive: true });
    return resolvedDir;
  }

  private async cleanupOldBackups(backupDir: string) {
    const retentionDays = parseInt(this.getEnv('BACKUP_RETENTION_DAYS', '15'), 10);
    const entries = await fs.promises.readdir(backupDir);
    const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

    await Promise.all(
      entries
        .filter((name) => name.endsWith('.gz'))
        .map(async (name) => {
          const fullPath = path.join(backupDir, name);
          const stat = await fs.promises.stat(fullPath);
          if (stat.mtime.getTime() < cutoff) {
            await fs.promises.unlink(fullPath);
          }
        }),
    );
  }

  private runCommand(command: string, args: string[]) {
    return new Promise<void>((resolve, reject) => {
      const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
      let stderr = '';
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      child.on('error', (error) => {
        reject(error);
      });
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`${command} failed with code ${code}: ${stderr}`));
        }
      });
    });
  }

  private formatTimestamp(date: Date) {
    const pad = (value: number) => value.toString().padStart(2, '0');
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate()),
      '-',
      pad(date.getHours()),
      pad(date.getMinutes()),
      pad(date.getSeconds()),
    ].join('');
  }

  private getEnv(key: string, fallback: string) {
    return this.configService.get<string>(key) ?? fallback;
  }

  private getErrorMessage(error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
