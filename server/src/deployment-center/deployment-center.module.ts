import { Module } from '@nestjs/common';
import { DeploymentCenterService } from './deployment-center.service';
import { GithubController } from './github/github.controller';
import { DropboxController } from './dropbox/dropbox.controller';
import { OnedriveController } from './onedrive/onedrive.controller';
import { AzureDevOpsController } from './azure-dev-ops/azure-dev-ops.controller';
import { BitbucketsController } from './bitbuckets/bitbuckets.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [GithubController, DropboxController, OnedriveController, AzureDevOpsController, BitbucketsController],
  providers: [DeploymentCenterService],
})
export class DeploymentCenterModule {}
