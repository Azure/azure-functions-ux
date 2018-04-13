import { Constants } from './constants';
declare var require: any;

export class MobileAppsClient {
    private _client: any;

    constructor(public _mainSiteUrl: string) {
        const WindowsAzure = require('azure-mobile-apps-client');
        this._client = new WindowsAzure.MobileServiceClient(this._mainSiteUrl);
    }

    AADLogin(options?: any): Promise<any> {
        if (options) {
            return this._client.loginWithOptions('aad', options);
        }

        return this._client.login('aad');
    }

    retrieveOID(options?: any, input?: any): Promise<any> {
        const authMe = this._mainSiteUrl.concat('/.auth/me');

        // Mobile Service Client returns promises that only support the 'then' continuation (for now):
        // https://azure.github.io/azure-mobile-apps-js-client/global.html#Promise

        return this.AADLogin(options)
            .then(() => {
                return this._client.invokeApi(authMe);
            }).then(r => {
                let response;
                // Response prepended and appended with [, ]
                if (r.responseText[0] === '[') {
                    response = r.responseText.substring(1, r.responseText.length - 1);
                }
                const json = JSON.parse(response);
                const user_claims = json.user_claims;
                let oid;
                for (let i = 0; i < user_claims.length; i++) {
                    if (user_claims[i].typ === Constants.OIDKey) {
                        oid = user_claims[i].val;
                    }
                }

                // App setting name in form: Identity.<alias>
                const appSettingName = 'Identity.'.concat(json.user_id.substring(0, json.user_id.indexOf('@')));

                if (input) {
                    input.value = '%'.concat(appSettingName, '%');
                }

                const values = {
                    appSettingName: appSettingName,
                    OID: oid,
                    token: json.access_token
                };

                return values;
            });
    }

}



