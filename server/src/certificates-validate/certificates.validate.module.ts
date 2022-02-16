import { Module } from '@nestjs/common';
import { CertificatesValidate } from './certificates.validate.controller';

@Module({
  imports: [],
  controllers: [CertificatesValidateController],
  providers: [],
})
export class CertificatesValidateModule {}
