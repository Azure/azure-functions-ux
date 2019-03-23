import { Injectable } from '@nestjs/common';
import { join, normalize } from 'path';
import { exists, readdir } from 'async-file';
import { readFileSync } from 'fs';
// tslint:disable:object-literal-key-quotes
const languageMap: { [key: string]: string } = {
  ja: 'ja-JP',
  ko: 'ko-KR',
  sv: 'sv-SE',
  cs: 'cs-CZ',
  'zh-hans': 'zh-CN',
  'zh-hant': 'zh-TW',
  'en-us': 'en',
  'en-gb': 'en',
};

@Injectable()
export class ResourcesService {
  private resourcesMap = {};
  private initialLoadPromise;
  constructor() {
    this.initialLoadPromise = Promise.all([this.loadResourceFiles()]);
  }

  async getResources(runtime: string, language: string) {
    await this.initialLoadPromise;
    const runtimeVersion = runtime.replace('~', '');

    let langCode = 'en';
    if (language !== 'en') {
      if (!!languageMap[language]) {
        langCode = languageMap[language];
      } else {
        langCode = `${language.toLowerCase()}-${language.toUpperCase()}`;
      }
    }

    // this is the ideal item to return, it is the correct language and version asked for
    const versionFile = (langCode === 'en' ? `Resources.${runtimeVersion}` : `Resources.${langCode}.${runtimeVersion}`).toLowerCase();
    // This means the version asked for don't exist but the strings for hte default version will be returned
    const defaultVersionFile = (langCode === 'en' ? 'Resources.default' : `Resources.${langCode}.default`).toLowerCase();
    // This is for development only so people can develop without having a templates folder laid out
    const defaultFallbackFile = 'resources';

    if (this.resourcesMap[versionFile]) {
      return this.resourcesMap[versionFile];
    } else if (this.resourcesMap[defaultVersionFile]) {
      return this.resourcesMap[defaultVersionFile];
    } else if (this.resourcesMap[defaultFallbackFile]) {
      return this.resourcesMap[defaultFallbackFile];
    }
    return {};
  }

  private async loadResourceFiles() {
    const resourcesDir = normalize(join(__dirname, '..', '..', 'data', 'resources'));
    const dirFiles = await readdir(resourcesDir);
    dirFiles.forEach(file => {
      const contents = readFileSync(join(resourcesDir, file), { encoding: 'UTF-8' });
      const resourceId = file.replace('.json', '');
      this.resourcesMap[resourceId.toLowerCase()] = JSON.parse(contents);
    });
  }
}
