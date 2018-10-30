export class Jwt {
  aud: string;
  iss: string;
  exp: number;

  // https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript
  static tryParseJwt(token: string): Jwt {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse(window.atob(base64));
    } catch (e) {
      return null;
    }
  }
}
