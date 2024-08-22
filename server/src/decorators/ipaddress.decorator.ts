import { createParamDecorator } from '@nestjs/common';
import * as requestIp from 'request-ip';

export const IpAddress = createParamDecorator((data, req): string => {
  let ip = '';
  let port = '';
  if (req.args && req.args.length > 0) {
    ip = requestIp.getClientIp(req.args[0]);
    if (req.args[0].connection && req.args[0].connection.remotePort) {
      port = req.args[0].connection.remotePort;
    }
  }
  return `${ip}:${port}`;
});
