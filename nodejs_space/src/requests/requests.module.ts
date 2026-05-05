import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { VendorRequestsController } from './vendor-requests.controller';

@Module({
  controllers: [RequestsController, VendorRequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
