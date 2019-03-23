import { Controller, Post, Body } from '@nestjs/common';
import { StorageService } from './storage.service';

@Controller('api')
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Post('getBlobSasUri')
  getBlobSasUri(@Body('connectionString') connectionString, @Body('containerName') containerName) {
    return this.storageService.getBlobSasUri(connectionString, containerName);
  }

  @Post('getStorageContainers')
  getStorageContainers(@Body('accountName') accountName, @Body('accessKey') accessKey) {
    return this.storageService.getStorageContainers(accountName, accessKey);
  }

  @Post('getStorageFileShares')
  getStorageFileShares(@Body('accountName') accountName, @Body('accessKey') accessKey) {
    return this.storageService.getFileShares(accountName, accessKey);
  }
}
