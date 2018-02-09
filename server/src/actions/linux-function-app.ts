import { Request, Response } from 'express';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import * as safeJson from 'circular-json';
import * as crypto from 'crypto';
import { LogHelper } from '../logHelper';
import { constants } from '../constants';

export async function getLinuxRuntimeToken(req: Request, res: Response) {
    const armId: string = req.params ? req.params[0] : '';
    const siteName = armId.split('/').filter(i => !!i).pop() || '';
    const getAppSettingsUrl = `${armId}/config/appsettings/list?api-version=${constants.AntaresAppSettingsApiVersion}`;
    const updateAppSettingsUrl = `${armId}/config/appsettings?api-version=${constants.AntaresAppSettingsApiVersion}`;
    const armToken = req.header('portal-token');

    // get app settings
    const appSettings = await getAppSettings(getAppSettingsUrl, armToken);
    if (appSettings) {
        const machineKey = appSettings['MACHINEKEY_DecryptionKey'];
        const handleToken = (error: Error, token: string) => {
            if (error) {
                LogHelper.error('getRuntimeToken', error);
                res.status(500).send(safeJson.stringify(error));
            } else {
                res.contentType('json').send(safeJson.stringify(token));
            }
        };

        if (machineKey) {
            getRuntimeToken(siteName, machineKey, handleToken);
        } else {
            const key = generateAESKey();
            if (await addMachineDecryptionKey(updateAppSettingsUrl, armToken, appSettings, key)) {
                getRuntimeToken(siteName, key, handleToken);
            } else {
                res.status(500);
            }
        }
    } else {
        res.status(500);
    }
}

async function getAppSettings(url: string, token: string | undefined) {
    try {
        const response = await axios.post(`https://management.azure.com/${url}`, null, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.properties as { [key: string]: string };
    } catch (err) {
        LogHelper.error('error-get-appsettings', err);
        return null;
    }
}

function generateAESKey() {
    return crypto.randomBytes(32).toString('hex').toUpperCase();
}

async function addMachineDecryptionKey(url: string, token: string | undefined, appSettings: { [key: string]: string }, key: string) {
    try {
        appSettings['MACHINEKEY_DecryptionKey'] = key;
        await axios.put(`https://management.azure.com/${url}`, { properties: appSettings }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return true;
    } catch (error) {
        LogHelper.error('update-appsettings', error);
        return false;
    }
}

function getRuntimeToken(siteName: string, key: string, callback: (err: Error, token: string) => void) {
    const issuer = `https://${siteName}.scm.azurewebsites.net`;
    const audience = `https://${siteName}.azurewebsites.net/azurefunctions`;
    const notBefore = Math.floor(Date.now() / 1000) - 10; // not before now - 10 seconds for clock skew
    const expires = Math.floor(Date.now() / 1000) + (10 * 60); // 10 minute token

    jwt.sign({
        iss: issuer,
        aud: audience,
        nbf: notBefore,
        exp: expires
    }, key, callback);
}
