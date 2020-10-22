import { Controller, Post, Body, HttpException, Headers } from '@nestjs/common';
import { WellKnownHeaders } from '../shared/http/wellknownheaders';
import { LoggingService } from '../shared/logging/logging.service';
import { StorageService } from './storage.service';

@Controller('api')
export class StorageController {
  constructor(private storageService: StorageService, private logService: LoggingService) {}

  @Post('getStorageContainers')
  async getStorageContainers(@Headers() headers, @Body('accountName') accountName, @Body('accessKey') accessKey) {
    if (!accountName) {
      throw new HttpException('Header must contain Storage Connection String', 400);
    }
    if (!accessKey) {
      throw new HttpException('Header must contain Storage Connection Container Name', 400);
    }

    try {
      return await this.storageService.getStorageContainers(accountName, accessKey);
    } catch (e) {
      // Task 8646582: Add server-side global exception handler to consistently log sessionId and requestId
      this.logService.error(
        {
          error: e,
          requestId: headers[WellKnownHeaders.REQUEST_ID],
          sessionId: headers[WellKnownHeaders.SESSION_ID],
        },
        'Failed to get storage containers'
      );

      throw new HttpException(`Failed to get storage containers: ${this._getErrorMessage(e)}`, this._getStatusCode(e));
    }
  }

  @Post('getStorageFileShares')
  async getStorageFileShares(@Headers() headers, @Body('accountName') accountName, @Body('accessKey') accessKey) {
    if (!accountName) {
      throw new HttpException('Header must contain Storage Connection String', 400);
    }
    if (!accessKey) {
      throw new HttpException('Header must contain Storage Connection Container Name', 400);
    }

    try {
      return await this.storageService.getFileShares(accountName, accessKey);
    } catch (e) {
      // Task 8646582: Add server-side global exception handler to consistently log sessionId and requestId
      this.logService.error(
        {
          error: e,
          requestId: headers[WellKnownHeaders.REQUEST_ID],
          sessionId: headers[WellKnownHeaders.SESSION_ID],
        },
        'Failed to get file shares'
      );

      throw new HttpException(`Failed to get file shares: ${this._getErrorMessage(e)}`, this._getStatusCode(e));
    }
  }

  private _getErrorMessage(e: any) {
    let message = '';
    if (!e) {
      return message;
    } else if (e.body) {
      message = `${e.body.Code} - ${e.body.message}`;
    } else if (e.message) {
      message = `${e.message}`;
    }

    return message;
  }

  private _getStatusCode(e: any) {
    return e && e.statusCode ? e.statusCode : 500;
  }
}
