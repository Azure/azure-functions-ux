import { Injectable, HttpException } from '@nestjs/common';
import { Constants } from '../../constants';
import { HttpService } from '../../shared/http/http.service';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { LoggingService } from '../../shared/logging/logging.service';

@Injectable()
export class RuntimeTokenService {
  constructor(private logService: LoggingService, private httpService: HttpService) {}

  async getLinuxRuntimeToken(armId: string, armToken: string) {
    const siteName =
      armId
        .split('/')
        .filter(i => !!i)
        .pop() || '';
    const getAppSettingsUrl = `${armId}/config/appsettings/list?api-version=${Constants.AntaresAppSettingsApiVersion}`;
    const updateAppSettingsUrl = `${armId}/config/appsettings?api-version=${Constants.AntaresAppSettingsApiVersion}`;

    // get app settings
    const appSettings = await this.getAppSettings(getAppSettingsUrl, armToken);
    if (appSettings) {
      const machineKey = appSettings.MACHINEKEY_DecryptionKey;
      const handleToken = (error: Error, token: string) => {
        if (error) {
          this.logService.error(error, '', 'getRuntimeToken');
          throw error;
        } else {
          return token;
        }
      };

      if (machineKey) {
        this.getRuntimeToken(siteName, machineKey, handleToken);
      } else {
        const key = this.generateAESKey();
        if (await this.addMachineDecryptionKey(updateAppSettingsUrl, armToken, appSettings, key)) {
          this.getRuntimeToken(siteName, key, handleToken);
        } else {
          throw new HttpException('Failed to add machine decryption key', 500);
        }
      }
    } else {
      throw new HttpException('Unable to fetch app settings', 500);
    }
  }

  private async getAppSettings(url: string, token: string | undefined) {
    try {
      const response = await this.httpService.post(`https://management.azure.com/${url}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.properties as { [key: string]: string };
    } catch (err) {
      this.logService.error(err, '', 'error-get-appsettings');
      return null;
    }
  }

  private generateAESKey() {
    return crypto
      .randomBytes(32)
      .toString('hex')
      .toUpperCase();
  }

  private async addMachineDecryptionKey(url: string, token: string | undefined, appSettings: { [key: string]: string }, key: string) {
    try {
      appSettings.MACHINEKEY_DecryptionKey = key;
      await this.httpService.put(
        `https://management.azure.com/${url}`,
        { properties: appSettings },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return true;
    } catch (error) {
      this.logService.error(error, '', 'update-appsettings');
      return false;
    }
  }

  private getRuntimeToken(siteName: string, key: string, callback: (err: Error, token: string) => void) {
    const issuer = `https://${siteName}.scm.azurewebsites.net`;
    const audience = `https://${siteName}.azurewebsites.net/azurefunctions`;
    const notBefore = Math.floor(Date.now() / 1000) - 10; // not before now - 10 seconds for clock skew
    const expires = Math.floor(Date.now() / 1000) + 10 * 60; // 10 minute token

    jwt.sign(
      {
        iss: issuer,
        aud: audience,
        nbf: notBefore,
        exp: expires,
      },
      key,
      callback
    );
  }
}
