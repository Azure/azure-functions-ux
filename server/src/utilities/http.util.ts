export class HttpUtil {
  public static getQueryParameterValue(nameIn: string, url: string): string {
    const name = nameIn.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
    const results = regex.exec(url);
    if (!results) {
      return '';
    }
    if (!results[2]) {
      return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
}
