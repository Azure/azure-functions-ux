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
import axios from 'axios';
import './polyfills';
import { getConfig } from './actions/ux-config';
import { proxy } from './actions/proxy';
import { getBindingConfig, getResources, getRuntimeVersion, getRoutingVersion, getTemplates, getQuickstart } from './actions/metadata';
import { staticConfig } from './config';
import { setupDeploymentCenter } from './deployment-center/deployment-center';
import { triggerFunctionAPIM } from './actions/apim';
import { NextFunction } from 'express';
import { getLinuxRuntimeToken } from './actions/linux-function-app';
import { setupAzureStorage } from './actions/storage';
import * as appInsights from 'applicationinsights';
import { trackAppServicePerformance } from './telemetry-helper';
import { validateContainerImage } from './actions/containerValidation';
import { LogHelper } from './logHelper';
const hsts = require('hsts');
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
  .use(express.static(path.join(__dirname, 'public', 'react')))
  .use(logger('combined'))
  .set('views', __dirname + '/views')
  .set('view engine', 'jsx')
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
        secure: true,
      },
    })
  )
  .use(
    hsts({
      maxAge: 15552000, // 180 days in seconds
    })
  );
app.engine('jsx', require('express-react-views').createEngine());
let packageJson = { version: '0.0.0' };
//This is done in sync because it's only on start up, should be fast and needs to be done for the route to be set up
if (fs.existsSync(path.join(__dirname, 'package.json'))) {
  packageJson = require('./package.json');
} else if (fs.existsSync(path.join(__dirname, '..', 'package.json'))) {
  packageJson = require('../package.json');
}
staticConfig.config.version = packageJson.version;
app.enable('trust proxy'); //This is needed for rate limiting to work behind iisnode
const redirectToAcom = (req: express.Request, res: express.Response, next: NextFunction) => {
  if (!req.query.trustedAuthority && !req.query['appsvc.devguide']) {
    LogHelper.log('redirect', { userAgent: req.headers['user-agent'] });
    res.redirect('https://azure.microsoft.com/services/functions/');
  } else {
    next();
  }
};

const versionCache: { [key: string]: any } = {};
const versionConfigPath = path.join(__dirname, 'public', 'ng-min', `${staticConfig.config.version}.json`);
if (fs.existsSync(versionConfigPath)) {
  const versionConfig = require(versionConfigPath);
  versionCache[staticConfig.config.version] = versionConfig;
}
const getVersionFiles = async (version: string) => {
  try {
    if (versionCache[version]) {
      return versionCache[version];
    }
    const versionCall = await axios.get(`https://functions.azure.com/ng-min/${version}.json`);
    const versionConfig = versionCall.data;
    versionCache[version] = versionConfig;
    return versionConfig;
  } catch (err) {
    return null;
  }
};

const reactHtmlCache: { [key: string]: string } = {};
const reactIndexPage = path.join(__dirname, 'public', 'react', 'index.react.html');
if (fs.existsSync(reactIndexPage)) {
  const reactHtml = fs.readFileSync(reactIndexPage, 'utf8');
  reactHtmlCache[staticConfig.config.version] = reactHtml;
}
const renderIndex = async (req: express.Request, res: express.Response) => {
  staticConfig.config.clientOptimzationsOff =
    req.query['appsvc.clientoptimizations'] && req.query['appsvc.clientoptimizations'] === 'false';
  const sendReact = req.query['appsvc.react'];
  const versionReq = req.query['appsvc.version'];

  if (sendReact) {
    if (reactHtmlCache[staticConfig.config.version]) {
      res.send(reactHtmlCache[staticConfig.config.version]);
    } else {
      res.sendStatus(404);
    }
  } else {
    const versionConfig = await getVersionFiles(versionReq || staticConfig.config.version);
    res.render('index', { ...staticConfig, version: versionConfig });
  }
};
app.get('/', redirectToAcom, renderIndex);

app.get('/signin', (_, res) => {
  res.redirect('https://portal.azure.com');
});

app.get('/try', (_, res) => {
  res.redirect('https://www.tryfunctions.com/try');
});

app.get('/api/ping', (_, res) => {
  res.send('success');
});

app.get('/api/health', (_, res) => {
  res.send('healthy');
});

app.get('/api/version', (_, res) => {
  res.send(staticConfig.config.version);
});

app.get('/api/debug', (_, res) => {
  //Generic Debug Data dump, can be added to as needed
  res.send({
    appName: process.env.WEBSITE_SITE_NAME,
    version: staticConfig.config.version,
  });
});

app.get('/api/templates', getTemplates);
app.get('/api/bindingconfig', getBindingConfig);
app.get('/api/quickstart', getQuickstart);
app.get('/api/resources', getResources);
app.get('/api/latestruntime', getRuntimeVersion);
app.get('/api/latestrouting', getRoutingVersion);
app.get('/api/config', getConfig);
app.post('/api/proxy', proxy);
app.post('/api/passthrough', proxy);
app.post('/api/triggerFunctionAPIM', triggerFunctionAPIM);
app.get('/api/runtimetoken/*', getLinuxRuntimeToken);
app.post('/api/validateContainerImage', validateContainerImage);
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
  var privateKey = fs.readFileSync('localhost.key', 'utf8');
  var certificate = fs.readFileSync('localhost.crt', 'utf8');

  const httpsServer = https.createServer({ key: privateKey, cert: certificate }, app as any);

  httpsServer.listen(44300);
}
