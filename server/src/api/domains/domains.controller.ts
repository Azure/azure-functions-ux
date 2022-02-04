import { Controller, Get } from '@nestjs/common';
import { IpAddress } from '../../decorators/ipaddress.decorator';

@Controller('api')
export class ApiController {
  @Get('domainAgreementInfo')
  DomainAgreementInfo(@IpAddress() ipAddress) {
    return {
      AgreedBy: ipAddress,
      AgreedAt: new Date().toISOString(),
      AgreementKeys: null,
    };
  }
}
