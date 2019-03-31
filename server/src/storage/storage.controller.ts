import { Controller, Post, Body, UseInterceptors, UploadedFile, Headers, HttpException } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api')
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Post('getStorageContainers')
  getStorageContainers(@Body('accountName') accountName, @Body('accessKey') accessKey) {
    if (!accountName) {
      throw new HttpException('Header must contain Storage Connection String', 400);
    }
    if (!accessKey) {
      throw new HttpException('Header must contain Storage Connection Container Name', 400);
    }

    return this.storageService.getStorageContainers(accountName, accessKey);
  }

  @Post('getStorageFileShares')
  getStorageFileShares(@Body('accountName') accountName, @Body('accessKey') accessKey) {
    if (!accountName) {
      throw new HttpException('Header must contain Storage Connection String', 400);
    }
    if (!accessKey) {
      throw new HttpException('Header must contain Storage Connection Container Name', 400);
    }
    return this.storageService.getFileShares(accountName, accessKey);
  }
}
