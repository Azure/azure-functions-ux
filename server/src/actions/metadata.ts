import { Request, Response } from 'express';
import * as fs from 'async-file';
import * as path from 'path';

const _languageMap: { [key: string]: string } = {
    ja: 'ja-JP',
    ko: 'ko-KR',
    sv: 'sv-SE',
    cs: 'cs-CZ',
    'zh-hans': 'zh-CN',
    'zh-hant': 'zh-TW'
};

export async function getTemplates(req: Request, res: Response) {
    const runtime: string = req.query['runtime'] || 'default';
    const versionFile = path.join(__dirname, 'templates', runtime.replace('~', '') + '.json');
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
    const versionFile = path.join(__dirname, 'bindings', runtime.replace('~', '') + '.json');
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
    const name: string = req.query['name'] || 'en';

    let langCode = 'en';
    if (name !== 'en') {
        if (!!_languageMap[name]) {
            langCode = _languageMap[name];
        } else {
            langCode = `${name.toLowerCase()}-${name.toUpperCase()}`;
        }
    }

    const cleanRuntimeVersion = runtime.replace('~', '');
    //this is the ideal item to return, it is the correct language and version asked for
    var versionFile = langCode === 'en' ? `Resources.${cleanRuntimeVersion}.json` : `Resources.${langCode}.${cleanRuntimeVersion}.json`;
    //This means the version asked for don't exist but the strings for hte default version will be returned
    var defaultVersionFile = langCode === 'en' ? 'Resources.default.json' : `Resources.${langCode}.default.json`;
    //This is for development only so people can develop without having a templates folder laid out
    var defaultFallbackFile = langCode === 'en' ? 'Resources.json' : 'Resources.${langCode}.json';

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
