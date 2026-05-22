import { Module } from '@nestjs/common';
import { ClientPointsService } from './client-points.service';
import { ClientPointsController } from './client-points.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClientPointsController],
  providers: [ClientPointsService],
  exports: [ClientPointsService],
})
export class ClientPointsModule {}
