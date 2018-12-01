import { Application } from 'express';
import * as azure from 'azure-storage';
import * as multer from 'multer';
import * as stream from 'stream';
import * as RateLimit from 'express-rate-limit';

export function setupAzureStorage(app: Application) {
  const storage = multer.memoryStorage();
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB
      files: 1,
    },
  });
  app.post('/api/getBlobSasUri', async (req, res) => {
    const connectionString = req.body.connectionString;
    const containerName = req.body.containerName;
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

    blobService.createContainerIfNotExists(containerName, (err, _) => {
      if (err) {
        //TODO: Figure out what to log here
        res.sendStatus(500);
      } else {
        const token = blobService.generateSharedAccessSignature(containerName, 'package.zip', sharedAccessPolicy);
        const sasUrl = blobService.getUrl(containerName, 'package.zip', token);
        res.json({
          sasUrl: sasUrl,
        });
      }
    });
  });

  const apiLimiter = new RateLimit({
    windowMs: 60 * 1000, // 5 requests per 1 minute
    max: 5,
  });
  app.post('/api/upload-file', apiLimiter, upload.single('file'), function(req, res) {
    const connectionString = req.headers.connectionstring as string;
    const containerName = req.headers.containername as string;
    const blobService = azure.createBlobService(connectionString);
    const fileStream = new stream.PassThrough();
    fileStream.end(req.file.buffer);
    blobService.createBlockBlobFromStream(containerName, 'package.zip', fileStream, req.file.size, (err, _) => {
      if (err) {
        //TODO: Figure out what to log here
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    });
  });

  app.post('/api/getStorageContainers', async (req, res) => {
    const blobService = azure.createBlobService(req.body.accountName, req.body.accessKey);
    let containers: azure.BlobService.ContainerResult[] = [];
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

    blobService.listContainersSegmented(continuationToken, (err: Error, result: azure.BlobService.ListContainerResult) => {
      aggregator(err, result, (err: Error, containers: azure.BlobService.ContainerResult[]) => {
        if (err) {
          res.status(400).send(err);
        } else {
          res.status(200).send(containers);
        }
      });
    });
  });

  app.post('/api/getStorageFileShares', async (req, res) => {
    const fileService = azure.createFileService(req.body.accountName, req.body.accessKey);
    let shares: azure.FileService.ShareResult[] = [];
    let continuationToken: any; // NOTE(michinoy): Cannot to set it to 'ContinuationToken' type as passing in null (requirement) does not compile.

    const aggregator = (err: Error, result: azure.FileService.ListSharesResult, cb: any) => {
      if (err) {
        cb(err, []);
      } else {
        shares = shares.concat(result.entries);
        if (result.continuationToken !== null) {
          fileService.listSharesSegmented(<any>result.continuationToken, aggregator);
        } else {
          cb(null, shares);
        }
      }
    };

    fileService.listSharesSegmented(continuationToken, (err: Error, result: azure.FileService.ListSharesResult) => {
      aggregator(err, result, (err: Error, shares: azure.FileService.ShareResult[]) => {
        if (err) {
          res.status(400).send(err);
        } else {
          res.status(200).send(shares);
        }
      });
    });
  });
}
