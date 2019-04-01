import { Module, CacheModule, MiddlewareConsumer } from '@nestjs/common';
import { HomeController } from './home/home.controller';
import { HomeServiceProd } from './home/home.service.prod';
import { SharedModule } from '../shared/shared.module';
import { HomeService } from './home/home.service.base';
import { HomeServiceDev } from './home/home.service.dev';

const HomeServiceProvider = {
  provide: HomeService,
  useClass: process.env.NODE_ENV === 'production' ? HomeServiceProd : HomeServiceDev,
};
const redirectMiddleware = (req, res, next) => {
  if (!req.query.trustedAuthority && !req.query['appsvc.devguide'] && !req.query['appsvc.react']) {
    res.redirect('https://azure.microsoft.com/services/functions/');
    return;
  }
  next();
};

@Module({
  imports: [
    SharedModule,
    CacheModule.register({
      ttl: 60, // seconds
    }),
  ],
  controllers: [HomeController],
  providers: [HomeServiceProvider],
})
export class HomeModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(redirectMiddleware).forRoutes(HomeController);
  }
}
