import { Injectable, OnModuleInit } from '@nestjs/common';
import { join, normalize } from 'path';
import { exists, readdir, readFile } from 'async-file';
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
export class ResourcesService implements OnModuleInit {
  private resourcesMap = {};

  async onModuleInit() {
    await this.loadResourceFiles();
  }
  async getResources(runtime: string, language: string) {
    const runtimeVersion = runtime.replace('~', '');
    const langLower = language.toLowerCase();
    let langCode = 'en';
    if (langLower !== 'en') {
      if (!!languageMap[langLower]) {
        langCode = languageMap[langLower];
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
    }
    if (this.resourcesMap[defaultVersionFile]) {
      return this.resourcesMap[defaultVersionFile];
    }
    if (this.resourcesMap[defaultFallbackFile]) {
      return this.resourcesMap[defaultFallbackFile];
    }
    return {};
  }

  private async loadResourceFiles() {
    const resourcesDir = normalize(join(__dirname, '..', '..', 'data', 'resources'));
    if (!(await exists(resourcesDir))) {
      return;
    }
    const dirFiles = await readdir(resourcesDir);
    const fileLoads = dirFiles.map(async file => {
      const contents = await readFile(join(resourcesDir, file), { encoding: 'utf8' });
      const resourceId = file.replace('.json', '');
      this.resourcesMap[resourceId.toLowerCase()] = JSON.parse(contents);
    });
    await Promise.all(fileLoads);
  }
}
