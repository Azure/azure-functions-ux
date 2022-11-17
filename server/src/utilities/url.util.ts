import { Site } from '@azure/arm-appservice';
import { ArmObj } from '../types/arm-obj';

export class Url {
  public static getMainUrl(site: ArmObj<Site>) {
    return `https://${site.properties.defaultHostName}`;
  }
}
