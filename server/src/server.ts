import * as configLoader from './keyvault-config';
import * as https from 'https';
import * as fs from 'fs';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as http from 'http';
import * as compression from 'compression';
import * as azure from 'azure-storage';
import * as multer from 'multer';
import './polyfills';
import { getConfig } from './actions/ux-config';
import { proxy } from './actions/proxy';
import { getBindingConfig, getResources, getRuntimeVersion, getRoutingVersion, getTemplates } from './actions/metadata';
import { staticConfig } from './config';
import { setupDeploymentCenter } from './deployment-center/deployment-center';
import { triggerFunctionAPIM } from './actions/apim';
import { NextFunction } from 'express';
import { getLinuxRuntimeToken } from './actions/linux-function-app';

const upload = multer({ dest: 'uploads/' })
const cookieSession = require('cookie-session');
const appInsights = require('applicationinsights');
if (process.env.aiInstrumentationKey) {
    appInsights
        .setup(process.env.aiInstrumentationKey)
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(true)
        .setUseDiskRetryCaching(true)
        .start();
}

const app = express();
//Load config before anything else
configLoader.config();
app
    .use(compression())
    .use(express.static(path.join(__dirname, 'public')))
    .use(logger('combined'))
    .set('view engine', 'pug')
    .set('views', 'src/views')
    .set('view cache', true)
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(cookieParser())
    .use(
        cookieSession({
            //This session cookie will live as long as the session and be used for authentication/security purposes
            name: 'session',
            keys: [process.env.SALT],
            cookie: {
                httpOnly: true,
                secure: true
            }
        })
    );
const redirectToAcom = (req: express.Request, res: express.Response, next: NextFunction) => {
    if (!req.query.trustedAuthority && !req.query['appsvc.devguide']) {
        res.redirect('https://azure.microsoft.com/services/functions/');
    }
    else {
        next();
    }
};

const renderIndex = (req: express.Request, res: express.Response) => {
    staticConfig.config.clientOptimzationsOff = req.query['appsvc.clientoptimizations'] && req.query['appsvc.clientoptimizations'] === 'false';
    res.render('index', staticConfig);
};
app.get('/', redirectToAcom, renderIndex);

app.get('/signin', (_, res) => {
    res.redirect('https://portal.azure.com')
});

app.get('/try', (_, res) => {
    res.redirect('https://www.tryfunctions.com/try')
});

app.get('/api/ping', (_, res) => {
    res.send('success');
});

app.get('/api/health', (_, res) => {
    res.send('healthy');
});

app.get('/api/templates', getTemplates);
app.get('/api/bindingconfig', getBindingConfig);

app.get('/api/resources', getResources);
app.get('/api/latestruntime', getRuntimeVersion);
app.get('/api/latestrouting', getRoutingVersion);
app.get('/api/config', getConfig);
app.post('/api/proxy', proxy);
app.post('/api/passthrough', proxy);
app.post('/api/triggerFunctionAPIM', triggerFunctionAPIM);
app.get('/api/runtimetoken/*', getLinuxRuntimeToken)
setupDeploymentCenter(app);


app.post('/api/upload-file', upload.single('file'), function (req, res) {
    const sasUrl = req.headers.sasurl as string;
    const blobService = azure.createBlobService(sasUrl);
    blobService.createBlockBlobFromLocalFile('runfromzipstore', 'package.zip', path.join(__dirname, '..', 'uploads', req.file.filename), (e, _) => {
        if (e) res.status(500);
        fs.unlink(path.join(__dirname, '..', 'uploads', req.file.filename));
        res.sendStatus(200);
    });
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
})

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

    blobService.createContainerIfNotExists('runfromzipstore', (_, __) => {
        var token = blobService.generateSharedAccessSignature('runfromzipstore', 'package.zip', sharedAccessPolicy);
        var sasUrl = blobService.getUrl('runfromzipstore', 'package.zip', token);
        res.send(`{"sasUrl":"${sasUrl}"}`);
    });
    
});

// function generateServiceProperties() {
//     return {
//       Logging: {
//         Version: '1.0',
//         Delete: true,
//         Read: true,
//         Write: true,
//         RetentionPolicy: {
//           Enabled: true,
//           Days: 10,
//         },
//       },
//       HourMetrics: {
//         Version: '1.0',
//         Enabled: true,
//         IncludeAPIs: true,
//         RetentionPolicy: {
//           Enabled: true,
//           Days: 10,
//         },
//       },
//       MinuteMetrics: {
//         Version: '1.0',
//         Enabled: true,
//         IncludeAPIs: true,
//         RetentionPolicy: {
//           Enabled: true,
//           Days: 10,
//         },
//       },
//       Cors: {
//         CorsRule: [
//           {
//             AllowedOrigins: ['www.azure.com', 'www.microsoft.com'],
//             AllowedMethods: ['GET', 'PUT'],
//             AllowedHeaders: ['x-ms-meta-data*', 'x-ms-meta-target*', 'x-ms-meta-xyz', 'x-ms-meta-foo'],
//             ExposedHeaders: ['x-ms-meta-data*', 'x-ms-meta-source*', 'x-ms-meta-abc', 'x-ms-meta-bcd'],
//             MaxAgeInSeconds: 500,
//           },
//           {
//             AllowedOrigins: ['www.msdn.com', 'www.asp.com'],
//             AllowedMethods: ['GET', 'PUT'],
//             AllowedHeaders: ['x-ms-meta-data*', 'x-ms-meta-target*', 'x-ms-meta-xyz', 'x-ms-meta-foo'],
//             ExposedHeaders: ['x-ms-meta-data*', 'x-ms-meta-source*', 'x-ms-meta-abc', 'x-ms-meta-bcd'],
//             MaxAgeInSeconds: 500,
//           },
//         ],
//       },
//     };
//   }







// if are here, that means we didn't match any of the routes above including those for static content.
// render index and let angular handle the path.
app.get('*', renderIndex);
if (process.env.FUNCTIONS_SLOT_NAME) {
    function normalizePort(val: any) {
        var port = parseInt(val, 10);

        if (isNaN(port)) {
            // named pipe
            return val;
        }

        if (port >= 0) {
            // port number
            return port;
        }

        return false;
    }

    var port = normalizePort(process.env.PORT || '3000');
    app.set('port', port);
    var server = http.createServer(app as any);
    server.listen(port);
} else {
    //This is for localhost development
    var privateKey = fs.readFileSync('selfcertkey.pem', 'utf8');
    var certificate = fs.readFileSync('selfcert.pem', 'utf8');

    const httpsServer = https.createServer({ key: privateKey, cert: certificate }, app as any);

    httpsServer.listen(44300);
}
