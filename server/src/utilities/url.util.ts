import { ArmObj } from '../types/arm-obj';

export class Url {
  public static getMainUrl(site: ArmObj<any>) {
    return `https://${site.properties.defaultHostName}`;
  }
}
