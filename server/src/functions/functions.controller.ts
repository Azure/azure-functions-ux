import { Controller, Get, Post, Query, HttpException, Headers, Header, Param, Body, Res } from '@nestjs/common';
import { FunctionsService } from './functions.service';
import { TriggerApimService } from './trigger-apim/trigger-apim.service';
import { RuntimeTokenService } from './runtime-token/runtime-token.service';
import { Response } from 'express';

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
    @Body('resourceId') resourceId,
    @Body('functionInfo') functionInfo,
    @Body('functionInvokePath') functionInvokePath,
    @Body('functionUrls') functionUrls,
    @Body('hostUrls') hostUrls,
    @Body('systemUrls') systemUrls,
    @Body('hostKeys') hostKeys,
    @Body('functionKeys') functionKeys,
    @Body('xFunctionKey') xFunctionKey,
    @Body('authHeaders') authHeaders,
    @Res() res: Response
  ) {
    if (!!xFunctionKey && typeof xFunctionKey === 'string') {
      return this.functionService.runFunction(
        resourceId,
        functionInfo,
        functionInvokePath,
        functionUrls,
        hostUrls,
        systemUrls,
        authHeaders,
        res,
        hostKeys,
        functionKeys,
        xFunctionKey
      );
    } else {
      throw new HttpException('Your key is not valid', 400);
    }
  }
}
