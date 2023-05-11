import { Module } from '@nestjs/common';
import { DeploymentCenterService } from './deployment-center.service';
import { GithubController } from './github/github.controller';
import { DropboxController } from './dropbox/dropbox.controller';
import { OnedriveController } from './onedrive/onedrive.controller';
import { BitbucketsController } from './bitbuckets/bitbuckets.controller';
import { SharedModule } from '../shared/shared.module';
import { ACRController } from './acr/acr.controller';

@Module({
  imports: [SharedModule],
  controllers: [GithubController, DropboxController, OnedriveController, BitbucketsController, ACRController],
  providers: [DeploymentCenterService],
})
export class DeploymentCenterModule {}
