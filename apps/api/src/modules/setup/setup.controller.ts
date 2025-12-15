import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SetupService } from './setup.service';
import { RunSetupDto } from './dto/run-setup.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('setup')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Get('status')
  @ApiOperation({ summary: 'Check setup status' })
  async getStatus(@Request() req: any) {
    const status = await this.setupService.getSetupStatus(req.user.userId);
    return { success: true, data: status };
  }

  @Post('run')
  @ApiOperation({ summary: 'Run initial setup wizard' })
  async runSetup(@Request() req: any, @Body() setupDto: RunSetupDto) {
    const result = await this.setupService.runSetup(req.user.userId, setupDto);
    return {
      success: true,
      data: result,
      message: 'Setup completed successfully',
    };
  }
}
