import { Controller, Post } from '@nestjs/common';

@Controller('api/certificates/validate')
export class CertificatesValidate {
  @Post('privateKeyCertificate')
  validatePrivateKeyCertificate() {
    return {
      AgreedAt: new Date().toISOString(),
      AgreementKeys: null,
    };
  }
}
