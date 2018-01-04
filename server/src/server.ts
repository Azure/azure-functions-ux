import * as configLoader from './keyvaultConfig';
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

import * as compression from 'compression';

import './polyfills';
import { getTenants, switchTenant, getToken } from './actions/user-account';
import { getConfig } from './actions/ux-config';
import { proxy } from './actions/proxy';
import { getBindingConfig, getResources, getRuntimeVersion, getRoutingVersion, getTemplates } from './actions/metadata';
import { setupAuthentication, authenticate, maybeAuthenticate } from './authentication';
import { staticConfig } from './config';
import { setupDeploymentCenter } from './deployment-center/deployment-center';

const app = express();
//Load config before anything else
configLoader
    .config({
        aadAccessToken:
            'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ing0Nzh4eU9wbHNNMUg3TlhrN1N4MTd4MXVwYyIsImtpZCI6Ing0Nzh4eU9wbHNNMUg3TlhrN1N4MTd4MXVwYyJ9.eyJhdWQiOiJodHRwczovL3ZhdWx0LmF6dXJlLm5ldCIsImlzcyI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzcyZjk4OGJmLTg2ZjEtNDFhZi05MWFiLTJkN2NkMDExZGI0Ny8iLCJpYXQiOjE1MTUxMDUwNDEsIm5iZiI6MTUxNTEwNTA0MSwiZXhwIjoxNTE1MTA4OTQxLCJhaW8iOiJZMk5nWU5oZWFmRlQxY2o3S3NzV3NUdDg1ZFhyQVE9PSIsImFwcGlkIjoiMzdjYWQ4ZTItMGY3Ni00NmI0LWE5NmYtZTI4OTJhOWY3MGI0IiwiYXBwaWRhY3IiOiIyIiwiZV9leHAiOjI2MjgwMCwiaWRwIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvNzJmOTg4YmYtODZmMS00MWFmLTkxYWItMmQ3Y2QwMTFkYjQ3LyIsIm9pZCI6IjczMjQzMThlLTJhMDctNGE0My04OTRiLWRjMTE4ZDY3NzA1NyIsInN1YiI6IjczMjQzMThlLTJhMDctNGE0My04OTRiLWRjMTE4ZDY3NzA1NyIsInRpZCI6IjcyZjk4OGJmLTg2ZjEtNDFhZi05MWFiLTJkN2NkMDExZGI0NyIsInV0aSI6IjhzdURPSk9oQUV5Wkw4RzJpbWdNQUEiLCJ2ZXIiOiIxLjAifQ.tWdFUWZVrUkPAoMj3fCPq9GKtNbRhdK1xVwm9DeofLkD7LLkwILksox7E8e5QdkgZr8-iK51dzY60sA4hd6_xL_fZTiRZLk8PR8HrUDpz-CO1FhSmSUK6uKxHW-kAWhwZpfhHFO_rijFa0BitQw0j7dwumrttXLmsjXN0AYPERehR8fvGIXcoCQ8XgfAbVFJvCygJv-jB-LQOtzvrDYr7g7EGrgIIe1ZSzqaBxJY6vNFCei52_V-VB8irIuBCBxg5derlTmzIyDBv8bJfzeZuEaUai9UXYNbH5EW2t7j0Iv_egHfkJNQC7ZuBr0bFMTdpFYf_LmaJrqCFzYwgOW6hw'
    })
    .then(() => {
        setupDeploymentCenter(app);
    })
    .catch(err => {
        console.log(err);
    });

app
    .use(compression())
    .use(express.static(path.join(__dirname, 'public')))
    .use(logger('dev'))
    .set('view engine', 'pug')
    .set('views', 'src/views')
    .use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true }))
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
    res.send(process.env.GITHUB_CLIENT_ID); //'healthy');
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
