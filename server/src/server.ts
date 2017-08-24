import { setupBitbucketAuthentication } from './deployment-center/bitbucketAuth';
import { setupGithubAuthentication } from './deployment-center/githubAuth';
import * as https from 'https';
import * as fs from 'fs';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';
import * as logger from 'morgan';
import * as passport from 'passport';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';

import './polyfills';
import { getTemplates } from './actions/templates';
import { getTenants, switchTenant, getToken } from './actions/user-account';
import { getConfig } from './actions/ux-config';
import { proxy } from './actions/proxy';
import {
    getBindingConfig,
    getResources,
    getRuntimeVersion,
    getRoutingVersion
} from './actions/metadata';
import {
    setupAuthentication,
    authenticate,
    maybeAuthenticate
} from './authentication';
import { config } from './config';

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

setupGithubAuthentication(app);

setupBitbucketAuthentication(app);

app.get('/', maybeAuthenticate, (_, res) => {
    res.render('index', {
        config: {
            runtimeType: config.runtimeType,
            azureResourceManagerEndpoint: config.azureResourceManagerEndpoint
        },
        // TODO: [ehamai] I wouldn't use "isAzure" or "isOnPrem" as properties. RuntimeType should contain all of those variations.
        isAzure: process.env.WEBSITE_SITE_NAME,
        isOnPrem: config.runtimeType === 'OnPrem',
        hostName: process.env.WEBSITE_HOSTNAME
    });
});

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

var privateKey = fs.readFileSync('selfcertkey.pem', 'utf8');
var certificate = fs.readFileSync('selfcert.pem', 'utf8');
const httpsServer = https.createServer(
    { key: privateKey, cert: certificate },
    app
);

httpsServer.listen(44300);
