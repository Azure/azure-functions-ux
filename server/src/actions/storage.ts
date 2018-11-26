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
    const containers: azure.BlobService.ContainerResult[] = [];
    let continuationToken: any; // NOTE(michinoy): Cannot to set it to 'ContinuationToken' type as passing in null (requirement) does not compile.
    let error;

    do {
      await blobService.listContainersSegmented(continuationToken, (err: Error, results: azure.BlobService.ListContainerResult) => {
        if (results) {
          continuationToken = results.continuationToken;
          containers.push(...results.entries);
        }

        error = err;
      });

      if (error) {
        res.status(400).send(error);
        return;
      }
    } while (continuationToken);

    res.status(200).send(containers);
  });

  app.post('/api/getStorageFileShares', async (req, res) => {
    const fileService = azure.createFileService(req.body.accountName, req.body.accessKey);
    const containers: azure.FileService.ShareResult[] = [];
    let continuationToken: any; // NOTE(michinoy): Cannot to set it to 'ContinuationToken' type as passing in null (requirement) does not compile.
    let error;

    do {
      await fileService.listSharesSegmented(continuationToken, (err: Error, results: azure.FileService.ListSharesResult) => {
        if (results) {
          continuationToken = results.continuationToken;
          containers.push(...results.entries);
        }

        error = err;
      });

      if (error) {
        res.status(400).send(error);
        return;
      }
    } while (continuationToken);

    res.status(200).send(containers);
  });
}
