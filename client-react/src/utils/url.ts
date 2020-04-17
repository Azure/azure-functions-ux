import { ArmObj } from '../models/arm-obj';
import { Site, HostType } from '../models/site/site';
import { KeyValue } from '../models/portal-models';

export default class Url {
  public static serviceHost =
    window.location.hostname === 'localhost' ||
    (window.appsvc && (window.appsvc.env.runtimeType === 'Standalone' || window.appsvc.env.runtimeType === 'OnPrem'))
      ? `https://${window.location.hostname}:${window.location.port}/`
      : `https://${window.location.hostname}/`;

  public static appendQueryString(url: string, queryString: string): string {
    if (!queryString) {
      return url;
    }

    if (url.includes('?')) {
      return `${url}&${queryString}`;
    }
    return `${url}?${queryString}`;
  }

  public static getFeatureValue(featureName: string) {
    return Url.getParameterByName(null, `appsvc.${featureName}`);
  }

  public static getParameterByName(url: string | null, name: string) {
    let urlFull = url;
    if (urlFull === null) {
      urlFull = window.location.href;
    }

    if (!name) {
      return null;
    }

    // eslint-disable-next-line no-useless-escape
    const sanatizedName = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${sanatizedName}(=([^&#]*)|&|#|$)`, 'i');
    const results = regex.exec(urlFull);

    if (!results) {
      return null;
    }

    if (!results[2]) {
      return '';
    }

    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  public static getParameterArrayByName(url: string | null, name: string) {
    const value = Url.getParameterByName(url, name);
    if (value) {
      return value.split(',');
    }
    return [];
  }

  public static getQueryStringObj() {
    if (!this.queryStrings) {
      this.queryStrings = {};
      let match: any;
      const pl = /\+/g; // Regex for replacing addition symbol with a space
      const search = /([^&=]+)=?([^&]*)/g;
      const decode = (s: any) => decodeURIComponent(s.replace(pl, ' '));
      const query = window.location.search.substring(1);
      // tslint:disable-next-line:no-conditional-assignment
      while ((match = search.exec(query))) {
        this.queryStrings[decode(match[1])] = decode(match[2]);
      }
    }

    return this.queryStrings;
  }

  // https://stackoverflow.com/questions/736513/how-do-i-parse-a-url-into-hostname-and-path-in-javascript
  public static getPath(url?: string) {
    const l = document.createElement('a');
    l.href = url || window.location.href;
    return l.pathname;
  }

  public static getHostName(url?: string) {
    const l = document.createElement('a');
    l.href = url || window.location.href;
    return l.hostname;
  }

  public static getPathAndQuery(url: string) {
    const l = document.createElement('a');
    l.href = url;
    return `${l.pathname}${l.search}`;
  }

  public static getMainUrl(site: ArmObj<Site>) {
    if (window.appsvc && window.appsvc.env.runtimeType.toLowerCase() === 'standalone' && !!site) {
      return `https://${site.properties.defaultHostName}/functions/${site.name}`;
    }
    return `https://${site.properties.defaultHostName}`;
  }

  public static getScmUrl(site: ArmObj<Site>) {
    if (window.appsvc && window.appsvc.env.runtimeType.toLowerCase() === 'standalone') {
      return this.getMainUrl(site);
    }

    const scmHost = site.properties.hostNameSslStates && site.properties.hostNameSslStates.find(s => s.hostType === HostType.Repository);
    return scmHost ? `https://${scmHost.name}` : this.getMainUrl(site);
  }

  public static getSyncTriggerUrl(site: ArmObj<Site>) {
    return `${this.getScmUrl(site)}/api/functions/synctriggers`;
  }

  private static queryStrings: KeyValue<string>;
}
