import { Injectable } from '@nestjs/common';
import * as azure from 'azure-storage';
import * as stream from 'stream';
@Injectable()
export class StorageService {
  async getBlobSasUri(connectionString: string, containerName: string) {
    const blobService = azure.createBlobService(connectionString);
    const startDate = new Date('1/1/2018');
    const expiryDate = new Date('1/1/2200');
    const sharedAccessPolicy = {
      AccessPolicy: {
        Permissions: 'r',
        Start: startDate,
        Expiry: expiryDate,
      },
    };

    return await new Promise((resolve, reject) => {
      blobService.createContainerIfNotExists(containerName, (err, _) => {
        if (err) {
          reject(err);
        } else {
          const token = blobService.generateSharedAccessSignature(containerName, 'package.zip', sharedAccessPolicy);
          const sasUrl = blobService.getUrl(containerName, 'package.zip', token);
          resolve({
            sasUrl,
          });
        }
      });
    });
  }

  async getStorageContainers(accountName: string, accessKey: string) {
    const blobService = azure.createBlobService(accountName, accessKey);
    let containers: azure.BlobService.ContainerResult[] = [];
    // tslint:disable-next-line: prefer-const
    let continuationToken: any; // NOTE(michinoy): Cannot to set it to 'ContinuationToken' type as passing in null (requirement) does not compile.

    const aggregator = (err: Error, result: azure.BlobService.ListContainerResult, cb: any) => {
      if (err) {
        cb(err, []);
      } else {
        containers = containers.concat(result.entries);
        if (result.continuationToken !== null) {
          blobService.listContainersSegmented(result.continuationToken, aggregator);
        } else {
          cb(null, containers);
        }
      }
    };

    // tslint:disable-next-line: no-shadowed-variable
    return await new Promise((resolve, reject) => {
      blobService.listContainersSegmented(continuationToken, (err: Error, result: azure.BlobService.ListContainerResult) => {
        aggregator(err, result, (errObj: Error, cont: azure.BlobService.ContainerResult[]) => {
          if (errObj) {
            reject(errObj);
          } else {
            resolve(cont);
          }
        });
      });
    });
  }

  async getFileShares(accountName: string, accessKey: string) {
    const fileService = azure.createFileService(accountName, accessKey);
    let shares: azure.FileService.ShareResult[] = [];
    // tslint:disable-next-line: prefer-const
    let continuationToken: any; // NOTE(michinoy): Cannot to set it to 'ContinuationToken' type as passing in null (requirement) does not compile.

    const aggregator = (err: Error, result: azure.FileService.ListSharesResult, cb: any) => {
      if (err) {
        cb(err, []);
      } else {
        shares = shares.concat(result.entries);
        if (result.continuationToken !== null) {
          fileService.listSharesSegmented(result.continuationToken, aggregator);
        } else {
          cb(null, shares);
        }
      }
    };
    // tslint:disable-next-line: no-shadowed-variable
    return new Promise((resolve, reject) => {
      fileService.listSharesSegmented(continuationToken, (err: Error, result: azure.FileService.ListSharesResult) => {
        aggregator(err, result, (errObj: Error, shrs: azure.FileService.ShareResult[]) => {
          if (errObj) {
            reject(errObj);
          } else {
            resolve(shrs);
          }
        });
      });
    });
  }

  async uploadFileToBlob(file: any, connectionString: string, containerName: string) {
    const blobService = azure.createBlobService(connectionString);
    const fileStream = new stream.PassThrough();
    fileStream.end(file.buffer);
    return new Promise((resolve, reject) => {
      blobService.createBlockBlobFromStream(containerName, 'package.zip', fileStream, file.size, (err, _) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
