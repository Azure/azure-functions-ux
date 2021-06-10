import { Injectable, HttpException } from '@nestjs/common';
import { Aborter, ServiceURL, SharedKeyCredential, StorageURL } from '@azure/storage-blob';
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
    const credentials = new SharedKeyCredential(accountName, accessKey);
    const pipeline = StorageURL.newPipeline(credentials);
    const serviceURL = new ServiceURL(`https://${accountName}.blob.${this.configService.endpointSuffix}`, pipeline);
    const aborter = Aborter.timeout(ONE_MINUTE);
    let containerSegment = await serviceURL.listContainersSegment(aborter);

    let containers = containerSegment.containerItems;

    while (containerSegment.nextMarker) {
      containerSegment = await serviceURL.listContainersSegment(aborter, containerSegment.nextMarker);
      containers = containers.concat(containerSegment.containerItems);
    }
    this.logService.log({ containers: containers.length }, 'Get Storage Containers');
    return containers;
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
