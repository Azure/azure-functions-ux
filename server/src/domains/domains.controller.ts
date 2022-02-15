import { Controller, Get } from '@nestjs/common';
import { IpAddress } from '../decorators/ipaddress.decorator';

@Controller('api/domains')
export class DomainsController {
  @Get('agreementInfo')
  AgreementInfo(@IpAddress() ipAddress) {
    return {
      AgreedBy: ipAddress,
      AgreedAt: new Date().toISOString(),
      AgreementKeys: null,
    };
  }
}
