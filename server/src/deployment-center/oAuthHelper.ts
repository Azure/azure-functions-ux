import axios from 'axios';
import { staticConfig } from '../config';
import * as crypto from 'crypto';
import { constants } from '../constants';

export class oAuthHelper {
    constructor(private _provider: string) {}

    public async getToken(aadToken: string): Promise<any> {
        try {
            const r = await axios.get(
                `${staticConfig.config.env.azureResourceManagerEndpoint}/providers/Microsoft.Web/sourcecontrols/${this
                    ._provider}?api-version=${constants.AntaresApiVersion}`,
                {
                    headers: {
                        Authorization: aadToken
                    }
                }
            );
            const body = r.data;
            if (body && body.properties && body.properties.token) {
                return { authenticated: true, token: body.properties.token };
            } else {
                return { authenticated: false };
            }
        } catch (_) {
            return { authenticated: false };
        }
    }

    public getParameterByName(name: string, url: string): string {
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return '';
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    public saveToken(token: string, aadToken: string, refreshToken: string = ''): Promise<any> {
        return axios.put(
            `${staticConfig.config.env.azureResourceManagerEndpoint}/providers/Microsoft.Web/sourcecontrols/${this
                ._provider}?api-version=${constants.AntaresApiVersion}`,
            {
                name: this._provider,
                properties: {
                    name: this._provider,
                    token: token,
                    refresh_token: refreshToken
                }
            },
            {
                headers: {
                    Authorization: aadToken
                }
            }
        );
    }

    public hashStateGuid(guid: string) {
        const hash = crypto.createHmac('sha256', process.env.SALT || '');
        hash.update(guid);
        return hash.digest('hex');
    }
}
