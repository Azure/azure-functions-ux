import { Module, HttpModule } from '@nestjs/common';
import { ProxyController } from './proxy.controller';
import { SharedModule } from '../shared/shared.module';
@Module({
  imports: [SharedModule],
  controllers: [ProxyController],
})
export class ProxyModule {}
