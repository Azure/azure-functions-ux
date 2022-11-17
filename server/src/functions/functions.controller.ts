import { Controller, Get, Post, Query, HttpException, Headers, Header, Param, Body, Res } from '@nestjs/common';
import { FunctionsService } from './functions.service';
import { TriggerApimService } from './trigger-apim/trigger-apim.service';
import { RuntimeTokenService } from './runtime-token/runtime-token.service';
import { Response } from 'express';
import { NameValuePair } from '@azure/arm-appservice';

@Controller('api')
export class FunctionsController {
  constructor(
    private functionService: FunctionsService,
    private runtimeTokenService: RuntimeTokenService,
    private triggerApimService: TriggerApimService
  ) {}

  @Get('templates')
  templates(@Query('runtime') runtime = 'default') {
    return this.functionService.getTemplates(runtime);
  }

  @Get('bindingconfig')
  bindingConfig(@Query('runtime') runtime = 'default') {
    return this.functionService.getBindings(runtime);
  }

  @Get('quickstart')
  @Header('Content-Type', 'text/markdown; charset=UTF-8')
  quickstart(@Query('fileName') fileName: string, @Query('language') language) {
    if (!fileName) {
      throw new HttpException('filename not provided', 400);
    }
    return this.functionService.getQuickStart(fileName, language);
  }

  @Get('runtimetoken/*')
  @Header('Content-Type', 'application/json')
  async runtimetoken(@Headers('portal-token') armToken, @Param('0') armId) {
    return this.runtimeTokenService.getLinuxRuntimeToken(armId, armToken);
  }

  @Post('triggerFunctionAPIM')
  triggerFunctionAPIM(@Body() body) {
    return this.triggerApimService.triggerFunctionAPIM(body);
  }

  @Post('runFunction')
  async runFunction(
    @Body('resourceId') resourceId: string,
    @Body('path') path: string,
    @Body('inputMethod') inputMethod: string,
    @Body('inputHeaders') inputHeaders: NameValuePair[],
    @Body('functionKey') functionKey: string,
    @Body('body') body,
    @Body('liveLogsSessionId') liveLogsSessionId: string,
    @Body('authToken') authToken: string,
    @Body('armEndpoint') armEndpoint: string,
    @Res() res: Response
  ) {
    if (!!functionKey && typeof functionKey === 'string') {
      const authHeaders = {
        Authorization: authToken,
        FunctionsPortal: '1',
      };
      return this.functionService.runFunction(
        resourceId,
        path,
        body,
        inputMethod,
        inputHeaders,
        authHeaders,
        armEndpoint,
        functionKey,
        liveLogsSessionId,
        res
      );
    } else {
      throw new HttpException('Your key is not valid', 400);
    }
  }
}
