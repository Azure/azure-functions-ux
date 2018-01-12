//BASED ON https://github.com/martinpeck/dotenv-keyvault/blob/master/index.js
import axios from 'axios';
const dotenvConfig = require('dotenv').config();

async function getAADTokenFromMSI(endpoint: string, secret: string, resource: string) {
    const apiVersion = '2017-09-01';

    try {
        let response = await axios.get(`${endpoint}/?resource=${resource}&api-version=${apiVersion}`, {
            headers: {
                Secret: secret
            }
        });
        console.log(response.data);
        return response.data.access_token;
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function config(props: any = {}) {
    const { aadAccessToken } = props;

    let aadToken;
    if (!aadAccessToken) {
        // no token - get one using Managed Service Identity inside process.env
        const resource = 'https://vault.azure.net';
        if (process.env.MSI_ENDPOINT && process.env.MSI_SECRET) {
            aadToken = await getAADTokenFromMSI(process.env.MSI_ENDPOINT as string, process.env.MSI_SECRET as string, resource);
        } else {
            aadToken = null;
        }
    } else if (typeof aadAccessToken === 'string') {
        aadToken = aadAccessToken;
    }

    const dotenvParsed = dotenvConfig.parsed || {};
    const envWithKeyvault = Object.assign({}, dotenvParsed);
    const token = aadToken;

    if (token) {
        const fetches = Object.keys(dotenvParsed).filter(key => dotenvParsed[key].match(/^kv:/)).map(async key => {
            const uri = dotenvParsed[key].replace(/^kv:/, '') + '?api-version=2016-10-01';
            try {
                const secretResponse = await axios.get(uri, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                envWithKeyvault[key] = secretResponse.data.value;
            } catch (err) {
                console.log(uri);
                console.log(err);
            }
        });
        await Promise.all(fetches);
    }
    process.env = Object.assign(process.env, envWithKeyvault);
}
