import { Application } from "express-serve-static-core";
import { ApiRequest } from "../types/request";
import { getGithubTokens } from "./github-auth";
import axios from 'axios';
import { LogHelper } from "../logHelper";

export function setupVsoPassthroughAuthentication(app: Application) {
    app.post('/api/sepupvso', async (req: ApiRequest<any>, res) => {
        const uri = `https://${req.query.accountName}.portalext.visualstudio.com/_apis/ContinuousDelivery/ProvisioningConfigurations?api-version=3.2-preview.1`;
        const headers = req.headers;
        const body = req.body;

        if (body.source && body.source.repository && body.source.repository.type === 'GitHub') {
            const githubToken = await getGithubTokens(req)
            body.source.repository.authorizationInfo.parameters.AccessToken = githubToken.token;
        }
        delete body.authToken;
        try {
            const result = await axios.post(uri, body, {
                headers: {
                    "Authorization": headers.vstsauthorization,
                    "Content-Type": "application/json",
                    "accept": "application/json;api-version=4.1-preview.1"
                }
            });
            res.status(result.status).send(result.data);
        }
        catch (err) {
            res.sendStatus(500);
            LogHelper.error('vso-passthrough', err);
        }
    });
}