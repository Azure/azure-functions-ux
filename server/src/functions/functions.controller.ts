import { Controller, Get, Post, Query, HttpException, Headers, Header, Param, Body, Res } from '@nestjs/common';
import { FunctionsService, NameValuePair } from './functions.service';
import { RuntimeTokenService } from './runtime-token/runtime-token.service';
import { Response } from 'express';
import { ArmSiteDescriptor, FunctionDescriptor } from '../shared/resourceDescriptors';
import { isValidString } from '../utilities/string.util';

@Controller('api')
export class FunctionsController {
  constructor(private functionService: FunctionsService, private runtimeTokenService: RuntimeTokenService) {}

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

  @Post('runFunction')
  async runFunction(
    @Body('resourceId') resourceId: string,
    @Body('path') path: string,
    @Body('inputMethod') inputMethod: string,
    @Body('inputHeaders') inputHeaders: NameValuePair[],
    @Body('functionKey') functionKey: string,
    @Body('body') body,
    @Body('liveLogsSessionId') liveLogsSessionId: string,
    @Body('clientRequestId') clientRequestId: string,
    @Body('authToken') authToken: string,
    @Res() res: Response
  ) {
    if (isResourceIdValid(resourceId) && isPathValid(path)) {
      return this.functionService.runFunction(
        resourceId,
        path,
        body,
        inputMethod,
        inputHeaders,
        authToken,
        clientRequestId,
        functionKey,
        liveLogsSessionId,
        res
      );
    } else {
      throw new HttpException('Invalid input', 400);
    }
  }

  @Post('getTestDataFromFunctionHref')
  async getTestDataFromFunctionHref(
    @Body('resourceId') resourceId: string,
    @Body('functionKey') functionKey: string,
    @Body('clientRequestId') clientRequestId: string,
    @Body('authToken') authToken: string,
    @Res() res: Response
  ) {
    if (isResourceIdValid(resourceId)) {
      return this.functionService.getTestDataFromFunctionHref(resourceId, functionKey, clientRequestId, authToken, res);
    } else {
      throw new HttpException('Invalid input', 400);
    }
  }
}

const isPathValid = (path: string): boolean => {
  return isValidString(path) && path.startsWith('/') && !path.includes('@');
};

const isResourceIdValid = (resourceId: string): boolean => {
  try {
    const siteDescriptor = ArmSiteDescriptor.getSiteDescriptor(resourceId);
    if (!isValidString(resourceId) || resourceId.includes('@') || !(siteDescriptor instanceof FunctionDescriptor)) {
      return false;
    }
    const siteName = siteDescriptor.getFormattedTargetSiteName();
    return !!siteName && !!siteDescriptor.subscription && !!siteDescriptor.resourceGroup;
  } catch (e) {
    throw new HttpException(e, 400);
  }
};
