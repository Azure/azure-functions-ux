import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { SharedModule } from '../shared/shared.module';
import { ResourcesService } from './resources/resources.service';

@Module({
  imports: [SharedModule],
  controllers: [ApiController],
  providers: [ResourcesService],
})
export class ApiModule {}
