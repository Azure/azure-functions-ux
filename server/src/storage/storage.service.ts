import { Injectable } from '@nestjs/common';
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import {
  Aborter as FileAborter,
  ServiceURL as FileServiceURL,
  SharedKeyCredential as FileSharedKeyCredential,
  StorageURL as FileStorageURL,
} from '@azure/storage-file';
import { LoggingService } from '../shared/logging/logging.service';
import { ConfigService } from '../shared/config/config.service';

const ONE_MINUTE = 60 * 1000;

@Injectable()
export class StorageService {
  constructor(private logService: LoggingService, private configService: ConfigService) {}

  async getStorageContainers(accountName: string, accessKey: string) {
    const credentials = new StorageSharedKeyCredential(accountName, accessKey);
    const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.${this.configService.endpointSuffix}`, credentials);
    const containers = blobServiceClient.listContainers();
    const retContainers = [];
    let nextContainers = await containers.next();
    while (!nextContainers.done) {
      retContainers.push(nextContainers.value);
      nextContainers = await containers.next();
    }

    return retContainers;
  }

  async getFileShares(accountName: string, accessKey: string) {
    const credentials = new FileSharedKeyCredential(accountName, accessKey);
    const pipeline = FileStorageURL.newPipeline(credentials);
    const serviceURL = new FileServiceURL(`https://${accountName}.file.${this.configService.endpointSuffix}`, pipeline);
    const aborter = FileAborter.timeout(ONE_MINUTE);

    let fileSegment = await serviceURL.listSharesSegment(aborter);
    let shares = fileSegment.shareItems;
    while (fileSegment.nextMarker) {
      fileSegment = await serviceURL.listSharesSegment(aborter, fileSegment.nextMarker);
      shares = shares.concat(fileSegment.shareItems);
    }

    this.logService.log({ shares: shares.length }, 'Get Storage Shares');
    return shares;
  }
}
