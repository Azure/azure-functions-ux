export class Url {
  private static _queryStrings: { [key: string]: string };

  public static getFeatureValue(featureName: string): string {
    return Url.getParameterByName(null, `appsvc.${featureName}`);
  }

  public static getParameterByName(url, name) {
    if (url === null) {
      url = window.location.href;
    }

    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)', 'i');

    const results = regex.exec(url);

    if (!results) {
      return null;
    }

    if (!results[2]) {
      return '';
    }

    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  public static getParameterArrayByName(url, name) {
    const value = Url.getParameterByName(url, name);
    if (value) {
      return value.split(',');
    } else {
      return [];
    }
  }

  public static getQueryStringObj() {
    if (!this._queryStrings) {
      this._queryStrings = {};
      let match: RegExpExecArray;
      const pl = /\+/g; // Regex for replacing addition symbol with a space
      const search = /([^&=]+)=?([^&]*)/g;
      const decode = function(s) {
        return decodeURIComponent(s.replace(pl, ' '));
      };
      const query = window.location.search.substring(1);

      while ((match = search.exec(query))) {
        this._queryStrings[decode(match[1])] = decode(match[2]);
      }
    }

    return this._queryStrings;
  }

  // https://stackoverflow.com/questions/736513/how-do-i-parse-a-url-into-hostname-and-path-in-javascript
  public static getPath(url: string) {
    const l = document.createElement('a');
    l.href = url;
    return l.pathname;
  }

  public static getHostName(url: string) {
    const l = document.createElement('a');
    l.href = url;
    return l.hostname;
  }
}
