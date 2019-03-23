import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { DeploymentCenterService } from './deployment-center.service';

@Controller('api')
export class DeploymentCenterController {
  constructor(private deploymentCenterService: DeploymentCenterService) {}
  @Post('SourceControlAuthenticationState')
  @HttpCode(200)
  getSourceControlAuthState(@Body('authToken') authToken) {
    return this.deploymentCenterService.getSourceControlAuthState(authToken);
  }
}
