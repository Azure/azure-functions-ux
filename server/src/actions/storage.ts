import { Application } from 'express';
import { Aborter, ServiceURL, SharedKeyCredential, StorageURL } from '@azure/storage-blob';
import {
  Aborter as FileAborter,
  ServiceURL as FileServiceURL,
  SharedKeyCredential as FileSharedKeyCredential,
  StorageURL as FileStorageURL,
} from '@azure/storage-file';
import { LogHelper } from '../logHelper';
const ONE_MINUTE = 60 * 1000;

export function setupAzureStorage(app: Application) {
  app.post('/api/getStorageContainers', async (req, res) => {
    try {
      const accountName = req.body.accountName;
      const accessKey = req.body.accessKey;
      const endpointSuffix = req.body.endpointSuffix || 'core.windows.net';
      const credentials = new SharedKeyCredential(accountName, accessKey);
      const pipeline = StorageURL.newPipeline(credentials);
      const serviceURL = new ServiceURL(`https://${accountName}.blob.${endpointSuffix}`, pipeline);
      const aborter = Aborter.timeout(ONE_MINUTE);
      let containerSegment = await serviceURL.listContainersSegment(aborter);

      let containers = containerSegment.containerItems;

      while (containerSegment.nextMarker) {
        containerSegment = await serviceURL.listContainersSegment(aborter, containerSegment.nextMarker);
        containers = containers.concat(containerSegment.containerItems);
      }
      LogHelper.log('storage-containers', { containers: containers.length });
      res.send(containers);
    } catch (err) {
      //This is mainly here to keep errors from crashing the server and will let us see what kinds of errors happen for the new server
      LogHelper.error('storage-containers', err);
      res.sendStatus(500);
    }
  });

  app.post('/api/getStorageFileShares', async (req, res) => {
    try {
      const accountName = req.body.accountName;
      const accessKey = req.body.accessKey;
      const endpointSuffix = req.body.endpointSuffix || 'core.windows.net';
      const credentials = new FileSharedKeyCredential(accountName, accessKey);
      const pipeline = FileStorageURL.newPipeline(credentials);
      const serviceURL = new FileServiceURL(`https://${accountName}.file.${endpointSuffix}`, pipeline);
      const aborter = FileAborter.timeout(ONE_MINUTE);

      let fileSegment = await serviceURL.listSharesSegment(aborter);
      let shares = fileSegment.shareItems || [];
      while (fileSegment.nextMarker) {
        fileSegment = await serviceURL.listSharesSegment(aborter, fileSegment.nextMarker);
        shares = shares.concat(fileSegment.shareItems || []);
      }

      LogHelper.log('storage-shares', { shares: shares.length });
      res.send(shares);
    } catch (err) {
      //This is mainly here to keep errors from crashing the server and will let us see what kinds of errors happen for the new server
      LogHelper.error('storage-shares', err);
      res.sendStatus(500);
    }
  });
}
