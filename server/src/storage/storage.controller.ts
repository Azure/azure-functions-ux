import { Controller, Post, Body, UseInterceptors, UploadedFile, Headers, HttpException } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file,
    @Headers('connectionstring') connectionString: string,
    @Headers('containername') containername: string
  ) {
    if (!connectionString) {
      throw new HttpException('Header must contain Storage Connection String', 400);
    }
    if (!containername) {
      throw new HttpException('Header must contain Storage Connection Container Name', 400);
    }

    return this.storageService.uploadFileToBlob(file, connectionString, containername);
  }
}
