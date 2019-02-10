export default class Url {
  public static appendQueryString(url: string, queryString): string {
    if (url.includes('?')) {
      return `${url}&${queryString}`;
    }
    return `${url}?${queryString}`;
  }

  public static getParameterByName(url: string | null, name: string) {
    let urlFull = url;
    if (urlFull === null) {
      urlFull = window.location.href;
    }

    const sanatizedName = name.replace(/[\[\]]/g, '\\$&');
    // tslint:disable-next-line:prefer-template
    const regex = new RegExp('[?&]' + sanatizedName + '(=([^&#]*)|&|#|$)', 'i');
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

  private static queryStrings: { [key: string]: string };
}
