import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { LoggingService } from '../shared/logging/logging.service';
import * as pem from 'pem';
import { ObjectUtil } from '../utilities/object.util';

@Controller('api/certificates/validate')
export class CertificatesValidateController {
  constructor(private loggingService: LoggingService) {}

  @Post('privateKeyCertificate')
  validatePrivateKeyCertificate(@Body() content) {
    const buff = Buffer.from(content.base64EncodedCertificate, 'base64');
    return pem.readPkcs12(buff, { p12Password: content.password }, (err, cert) => {
      if (ObjectUtil.isEmpty(cert)) {
        this.loggingService.error(err.message || '', err.stack || '', 'private-cert-bad');
        if (err.message) {
          throw new HttpException(err.response.data, err.response.status);
        }
        throw new HttpException('Internal Server Error', 500);
      }
      return { a: JSON.stringify(content) };
    });
  }
}
