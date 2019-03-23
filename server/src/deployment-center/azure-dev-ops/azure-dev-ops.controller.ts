import { Controller, Post, Query, Req, Body, Header, Res, HttpException } from '@nestjs/common';
import { DeploymentCenterService } from '../deployment-center.service';
import { ConfigService } from '../../shared/config/config.service';
import { LoggingService } from '../../shared/logging/logging.service';
import { HttpService } from '../../shared/http/http.service';
@Controller('api')
export class AzureDevOpsController {
  constructor(
    private dcService: DeploymentCenterService,
    private configService: ConfigService,
    private loggingService: LoggingService,
    private httpService: HttpService
  ) {}

  @Post('api/setupvso')
  async setupvso(@Query('accountName') accountName: string, @Body('authToken') authToken: string, @Body() body: any, @Req() req) {
    const uri = `https://${
      req.query.accountName
    }.portalext.visualstudio.com/_apis/ContinuousDelivery/ProvisioningConfigurations?api-version=3.2-preview.1`;
    const passHeaders = req.headers;
    if (body.source && body.source.repository && body.source.repository.type === 'GitHub') {
      const githubToken = await this.dcService.getSourceControlToken(authToken, 'github');
      body.source.repository.authorizationInfo.parameters.AccessToken = githubToken.token;
    }
    delete body.authToken;
    try {
      const headers: { [key: string]: string } = {
        Authorization: passHeaders.authorization as string,
        'Content-Type': 'application/json',
        accept: 'application/json;api-version=4.1-preview.1',
      };
      if (passHeaders['x-vss-forcemsapassthrough'] === 'true') {
        headers['X-VSS-ForceMsaPassThrough'] = 'true';
      }
      const result = await this.httpService.post(uri, body, {
        headers,
      });
      return result.data;
    } catch (err) {
      this.loggingService.error(err, '', 'vso-passthrough');
      if (err.response) {
        throw new HttpException(err.response.data, err.response.status);
      } else {
        throw new HttpException('Internal Server Error', 500);
      }
    }
  }
}
