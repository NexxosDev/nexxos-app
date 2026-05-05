import { Module, Global } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PushTokenController } from './push-token.controller';

@Global()
@Module({
  controllers: [PushTokenController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
