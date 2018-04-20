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
import './polyfills';
import { getConfig } from './actions/ux-config';
import { proxy } from './actions/proxy';
import { getBindingConfig, getResources, getRuntimeVersion, getRoutingVersion, getTemplates } from './actions/metadata';
import { staticConfig } from './config';
import { setupDeploymentCenter } from './deployment-center/deployment-center';
import { triggerFunctionAPIM } from './actions/apim';
import { NextFunction } from 'express';
import { getLinuxRuntimeToken } from './actions/linux-function-app';
import { setupAzureStorage } from './actions/storage';
import * as appInsights from 'applicationinsights';
import { trackAppServicePerformance } from './telemetry-helper';

const cookieSession = require('cookie-session');
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
    setInterval(trackAppServicePerformance, 30 * 1000);
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
app.enable('trust proxy'); //This is needed for rate limiting to work behind iisnode
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
setupAzureStorage(app);

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
