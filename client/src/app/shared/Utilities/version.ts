export class Version {
  public majorVersion: number;
  public minorVersion: number;
  private _version: string;

  constructor(version: string) {
    this._version = version;
    const versionParts = this._getRuntimeParts(version);
    this.majorVersion = this._majorVersion(versionParts);
    this.minorVersion = this._minorVersion(versionParts);
  }

  private _getRuntimeParts(version: string) {
    return version.split('.');
  }

  private _majorVersion(versionParts: string[]) {
    if (versionParts.length > 0) {
      return Number(versionParts[0]);
    }
    throw new Error('Invalid exact runtime provided: ' + this._version);
  }

  private _minorVersion(versionParts: string[]) {
    if (versionParts.length > 2) {
      return Number(versionParts[2]);
    }
    throw new Error('Invalid exact runtime provided: ' + this._version);
  }
}
