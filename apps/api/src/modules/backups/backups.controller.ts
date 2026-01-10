import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BackupsService, BackupInfo } from './backups.service';
import { RestoreBackupDto } from './dto/restore-backup.dto';

@ApiTags('backups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('backups')
export class BackupsController {
  constructor(private readonly backupsService: BackupsService) { }

  @Get()
  @ApiOperation({ summary: 'List available backups' })
  async listBackups(@Request() req: any) {
    const backups = await this.backupsService.listBackups(req.user.companyId);
    return { success: true, data: backups };
  }

  @Post('run')
  @ApiOperation({ summary: 'Run a manual backup' })
  async runBackup(@Request() req: any) {
    const backup = await this.backupsService.createBackup(req.user.companyId, 'manual');
    return { success: true, data: backup, message: 'Backup completed' };
  }

  @Post('restore')
  @ApiOperation({ summary: 'Restore a backup into a new database name' })
  async restoreBackup(@Request() req: any, @Body() restoreDto: RestoreBackupDto) {
    const result = await this.backupsService.restoreBackup(
      req.user.companyId,
      restoreDto.filename,
      restoreDto.targetDbName,
    );
    return { success: true, data: result, message: 'Restore completed' };
  }
}
