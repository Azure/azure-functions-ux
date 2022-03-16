import { Module } from '@nestjs/common';
import { HomeModule } from './home/home.module';
import { ApiModule } from './api/api.module';
import { SharedModule } from './shared/shared.module';
import { FunctionsModule } from './functions/functions.module';
import { CertificatesValidateModule } from './certificates-validate/certificates.validate.module';
import { DomainsModule } from './domains/domains.module';
import { ProxyModule } from './proxy/proxy.module';
import { StorageModule } from './storage/storage.module';
import { DeploymentCenterModule } from './deployment-center/deployment-center.module';
import { StacksModule } from './stacks/stacks.module';
import { StaticSitesModule } from './staticsites/staticsites.module';
import { WorkflowModule } from './workflows/workflows.module';

@Module({
  // HomeModule should always be last in this list because it includes the catch all route
  imports: [
    SharedModule,
    ApiModule,
    FunctionsModule,
    CertificatesValidateModule,
    DomainsModule,
    ProxyModule,
    StorageModule,
    DeploymentCenterModule,
    StaticSitesModule,
    StacksModule,
    WorkflowModule,
    HomeModule,
  ],
})
export class AppModule {}
