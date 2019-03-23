import { Module } from '@nestjs/common';
import { HomeController } from './home/home.controller';
import { HomeServiceProd } from './home/home.service.prod';
import { SharedModule } from '../shared/shared.module';
import { HomeService } from './home/home.service.base';
import { HomeServiceDev } from './home/home.service.dev';

const HomeServiceProvider = {
  provide: HomeService,
  useClass: process.env.NODE_ENV === 'production' ? HomeServiceProd : HomeServiceDev,
};
@Module({
  imports: [SharedModule],
  controllers: [HomeController],
  providers: [HomeServiceProvider],
})
export class HomeModule {}
