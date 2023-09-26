import { Module } from '@nestjs/common';
import { DeploymentCenterService } from './deployment-center.service';
import { GithubController } from './github/github.controller';
import { BitbucketsController } from './bitbuckets/bitbuckets.controller';
import { SharedModule } from '../shared/shared.module';
import { ACRController } from './acr/acr.controller';

@Module({
  imports: [SharedModule],
  controllers: [GithubController, BitbucketsController, ACRController],
  providers: [DeploymentCenterService],
})
export class DeploymentCenterModule {}
