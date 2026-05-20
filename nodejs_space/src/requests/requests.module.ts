import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { VendorRequestsController } from './vendor-requests.controller';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [PlansModule],
  controllers: [RequestsController, VendorRequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
