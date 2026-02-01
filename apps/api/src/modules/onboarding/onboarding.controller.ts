import { Body, Controller, Post, Request, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OnboardingService } from './onboarding.service';
import { QuickSetupDto } from './dto/quick-setup.dto';

@ApiTags('onboarding')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('quickstart')
  @ApiOperation({ summary: 'One-click onboarding: create/update company, seed basics, create admin' })
  async quickstart(@Request() req: any, @Body() dto: QuickSetupDto) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('Missing user context');
    }
    const result = await this.onboardingService.quickSetup(req.user.userId, dto);
    return { success: true, data: result };
  }
}
