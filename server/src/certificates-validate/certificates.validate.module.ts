import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { CertificatesValidateController } from './certificates.validate.controller';

@Module({
  imports: [SharedModule],
  controllers: [CertificatesValidateController],
  providers: [],
})
export class CertificatesValidateModule {}
