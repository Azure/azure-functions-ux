import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as fs from 'fs';
import { LoggingService } from './shared/logging/logging.service';
import * as cookieSession from 'cookie-session';
import * as cookieParser from 'cookie-parser';
import * as helmet from 'helmet';
import * as requestIp from 'request-ip';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';
import express = require('express');

function normalizePort(val) {
  const port = parseInt(val, 10);

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

async function bootstrap() {
  let app: NestExpressApplication;

  if (process.env.NODE_ENV !== 'production') {
    const privateKey = fs.readFileSync('localhost.key', 'utf8');
    const certificate = fs.readFileSync('localhost.crt', 'utf8');
    app = await NestFactory.create(AppModule, {
      httpsOptions: {
        key: privateKey,
        cert: certificate,
      },
      logger: new LoggingService(),
    });
  } else {
    app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: new LoggingService(),
    });
  }

  // This only applies to local development.  In Azure the CORS rules defined on the app takes precedence
  app.enableCors();
  app.useStaticAssets(join(__dirname, 'public'));
  app.useStaticAssets(join(__dirname, 'public', 'react'));
  app.use(
    helmet({
      frameguard: false,
      contentSecurityPolicy: false,
    })
  );
  app.use(cookieParser());
  app.use(requestIp.mw());
  app.use(
    cookieSession({
      // This session cookie will live as long as the session and be used for authentication/security purposes
      name: 'session',
      keys: [process.env.SALT],
      cookie: {
        httpOnly: true,
        secure: true,
      },
    })
  );
  app.use(bodyParser.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.enable('trust proxy');
  const port = normalizePort(process.env.PORT || '3000');
  await app.listen(port);
}
bootstrap();
