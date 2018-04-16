import { Application } from 'express';
import * as azure from 'azure-storage';
import * as multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';

export function setupAzureStorage(app: Application) {
    const upload = multer({ dest: 'uploads/' })
    app.post('/api/getBlobSasUri', async (req, res) => {
        const key = req.body.connectionString;

        var blobService = azure.createBlobService(key);
        var startDate = new Date('1/1/2018');
        var expiryDate = new Date('1/1/2200');
        var sharedAccessPolicy = {
            AccessPolicy: {
                Permissions: 'r',
                Start: startDate,
                Expiry: expiryDate
            }
        };

        blobService.createContainerIfNotExists('runfromzipstore', (err, _) => {
            if (err) res.sendStatus(500);
            var token = blobService.generateSharedAccessSignature('runfromzipstore', 'package.zip', sharedAccessPolicy);
            var sasUrl = blobService.getUrl('runfromzipstore', 'package.zip', token);
            res.send(`{"sasUrl":"${sasUrl}"}`);
        });

    });
    app.post('/api/upload-file', upload.single('file'), function (req, res) {
        const connectionString = req.headers.connectionstring as string;
        const blobService = azure.createBlobService(connectionString);
        const filePath = path.join(__dirname, '..', '..' , 'uploads', req.file.filename);
        blobService.createBlockBlobFromLocalFile('runfromzipstore', 'package.zip', filePath , (err, _) => {
            if (err) res.status(500);
            fs.unlink(filePath);
            res.sendStatus(200);
        });
    });
}