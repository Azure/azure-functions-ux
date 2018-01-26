import * as configLoader from './keyvaultConfig';
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
import { maybeAuthenticate } from './authentication';
import { staticConfig } from './config';
import { setupDeploymentCenter } from './deployment-center/deployment-center';
const cookieSession = require('cookie-session');
import { triggerFunctionAPIM } from './actions/apim';
const app = express();
//Load config before anything else
configLoader.config();
app
    .use(compression())
    .use(express.static(path.join(__dirname, 'public')))
    .use(logger('combined'))
    .set('view engine', 'pug')
    .set('views', 'src/views')
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(cookieParser())
    .use(
        cookieSession({
            //This session cookie will live as long as the session and be used for authentication/security purposes
            name: 'session',
            keys: [ process.env.SALT ]
        })
    );

const renderIndex = (req: express.Request, res: express.Response) => {
    staticConfig.config.clientOptimzationsOff =
        req.query['appsvc.clientoptimizations'] && req.query['appsvc.clientoptimizations'] === 'false';
    res.render('index', staticConfig);
};
app.get('/', maybeAuthenticate, renderIndex);

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

setupDeploymentCenter(app);
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
