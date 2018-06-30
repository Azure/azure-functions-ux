import { Request, Response } from 'express';
import { versionCompare, isNumericVersion } from '../utilities/versions';
import * as fs from 'async-file';
import * as path from 'path';

const _languageMap: { [key: string]: string } = {
  ja: 'ja-JP',
  ko: 'ko-KR',
  sv: 'sv-SE',
  cs: 'cs-CZ',
  'zh-hans': 'zh-CN',
  'zh-hant': 'zh-TW',
  'en-us': 'en',
  'en-gb': 'en'
};

const versionList: string[] = require('./data/supportedFunctionsFxVersions.json').sort(versionCompare);

function findLatestTemplateVersion(version: string): string {
  if (!isNumericVersion(version)) {
    return version;
  }
  let retVersion = versionList.filter(x => versionCompare(version, x) >= 0);

  return retVersion.length > 0 ? retVersion[retVersion.length - 1] : 'default';
}

export async function getTemplates(req: Request, res: Response) {
  const runtime: string = req.query['runtime'] || 'default';
  const runtimeVersion = findLatestTemplateVersion(runtime.replace('~', ''));
  const versionFile = path.join(__dirname, 'templates', runtimeVersion + '.json');
  const defaultFile = path.join(__dirname, 'templates', 'default.json');

  if (await fs.exists(versionFile)) {
    res.sendFile(versionFile);
  } else if (await fs.exists(defaultFile)) {
    res.sendFile(defaultFile);
  } else {
    res.sendStatus(404);
  }
}

export async function getBindingConfig(req: Request, res: Response) {
  const runtime: string = req.query['runtime'] || 'default';
  const runtimeVersion = findLatestTemplateVersion(runtime.replace('~', ''));
  const versionFile = path.join(__dirname, 'bindings', runtimeVersion + '.json');
  const defaultFile = path.join(__dirname, 'bindings', 'default.json');

  if (await fs.exists(versionFile)) {
    res.sendFile(versionFile);
  } else if (await fs.exists(defaultFile)) {
    res.sendFile(defaultFile);
  } else {
    res.sendStatus(404);
  }
}

export async function getResources(req: Request, res: Response) {
  const runtime: string = req.query['runtime'] || 'default';
  const runtimeVersion = findLatestTemplateVersion(runtime.replace('~', ''));
  const name: string = req.query['name'] || 'en';

  let langCode = 'en';
  if (name !== 'en') {
    if (!!_languageMap[name]) {
      langCode = _languageMap[name];
    } else {
      langCode = `${name.toLowerCase()}-${name.toUpperCase()}`;
    }
  }

  //this is the ideal item to return, it is the correct language and version asked for
  var versionFile = langCode === 'en' ? `Resources.${runtimeVersion}.json` : `Resources.${langCode}.${runtimeVersion}.json`;
  //This means the version asked for don't exist but the strings for hte default version will be returned
  var defaultVersionFile = langCode === 'en' ? 'Resources.default.json' : `Resources.${langCode}.default.json`;
  //This is for development only so people can develop without having a templates folder laid out
  var defaultFallbackFile = 'Resources.json';

  var folder = path.join(__dirname, 'resources');
  if (await fs.exists(path.join(folder, versionFile))) {
    res.sendFile(path.join(folder, versionFile));
  } else if (await fs.exists(path.join(folder, defaultVersionFile))) {
    res.sendFile(path.join(folder, defaultVersionFile));
  } else {
    res.sendFile(path.join(folder, defaultFallbackFile));
  }
}

export function getRuntimeVersion(_: Request, res: Response) {
  res.json('~1');
}

export function getRoutingVersion(_: Request, res: Response) {
  res.json('~0.2');
}
