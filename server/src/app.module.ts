import { Module } from '@nestjs/common';
import { HomeModule } from './home/home.module';
import { ApiModule } from './api/api.module';
import { SharedModule } from './shared/shared.module';
import { FunctionsModule } from './functions/functions.module';
import { ProxyModule } from './proxy/proxy.module';
import { StorageModule } from './storage/storage.module';
import { DeploymentCenterModule } from './deployment-center/deployment-center.module';
import { StacksModule } from './stacks/stacks.module';
import { StaticSitesModule } from './staticsites/staticsites.module';

@Module({
  // HomeModule should always be last in this list because it includes the catch all route
  imports: [
    SharedModule,
    ApiModule,
    FunctionsModule,
    ProxyModule,
    StorageModule,
    DeploymentCenterModule,
    StaticSitesModule,
    StacksModule,
    HomeModule,
  ],
})
export class AppModule {}
