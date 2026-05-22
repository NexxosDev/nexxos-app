import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ClientPointsService } from './client-points.service';

@ApiTags('Client Points')
@Controller('api/client')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientPointsController {
  constructor(private readonly pointsService: ClientPointsService) {}

  @Get('points')
  @ApiOperation({ summary: 'Get client points summary (total, level, progress, history)' })
  async getPoints(@Request() req: any) {
    return this.pointsService.getClientPointsSummary(req.user?.userId);
  }
}
