import * as https from 'https';
import * as fs from 'fs';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';
import * as logger from 'morgan';
import * as passport from 'passport';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as http from 'http';

import './polyfills';
import { getTenants, switchTenant, getToken } from './actions/user-account';
import { getConfig } from './actions/ux-config';
import { proxy } from './actions/proxy';
import { getBindingConfig, getResources, getRuntimeVersion, getRoutingVersion, getTemplates } from './actions/metadata';
import { setupAuthentication, authenticate, maybeAuthenticate } from './authentication';
import { staticConfig } from './config';

const app = express();

app
    .use(express.static(path.join(__dirname, 'public')))
    .use(logger('dev'))
    .set('view engine', 'pug')
    .set('views', 'src/views')
    .use(session({ secret: 'keyboard cat' }))
    .use(bodyParser.json())
    .use(cookieParser())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(passport.initialize())
    .use(passport.session());

setupAuthentication(app);

const renderIndex = (_: express.Request, res: express.Response) => {
    res.render('index', staticConfig);
};
app.get('/', maybeAuthenticate, renderIndex);

app.get('/api/ping', (_, res) => {
    res.send('success');
});

app.get('/api/health', (_, res) => {
    res.send('healthy');
});

app.get('/api/switchtenants/:tenantId', authenticate, switchTenant);

app.get('/api/templates', maybeAuthenticate, getTemplates);
app.get('/api/bindingconfig', maybeAuthenticate, getBindingConfig);

app.get('/api/tenants', authenticate, getTenants);
app.post('/api/tenants/switch/:tenantId', authenticate, switchTenant);
app.get('/api/token', authenticate, getToken);

app.get('/api/resources', maybeAuthenticate, getResources);
app.get('/api/latestruntime', maybeAuthenticate, getRuntimeVersion);
app.get('/api/latestrouting', maybeAuthenticate, getRoutingVersion);
app.get('/api/config', maybeAuthenticate, getConfig);
app.post('/api/proxy', maybeAuthenticate, proxy);
app.post('/api/passthrough', maybeAuthenticate, proxy);

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
