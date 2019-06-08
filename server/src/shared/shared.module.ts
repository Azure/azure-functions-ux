import { Module } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { LoggingService } from './logging/logging.service';
import { HttpService } from './http/http.service';

@Module({
  providers: [LoggingService, ConfigService, HttpService],
  exports: [LoggingService, ConfigService, HttpService],
})
export class SharedModule {}
