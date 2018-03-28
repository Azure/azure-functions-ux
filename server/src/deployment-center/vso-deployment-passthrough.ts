import { Application } from "express-serve-static-core";
import { ApiRequest } from "../types/request";
import { getGithubTokens } from "./github-auth";
import axios from 'axios';

export function setupVsoPassthroughAuthentication(app: Application) {
    //TODO change any to take type from angular code
    app.post('/api/sepupvso', async (req: ApiRequest<any>, res) => {
        const uri = `https://${req.query.accountName}.portalext.visualstudio.com/_apis/ContinuousDelivery/ProvisioningConfigurations?api-version=3.2-preview.1`;
        const headers = req.headers;
        const body = req.body;

        if (body.source && body.source.repository && body.source.repository.type === 'GitHub') {
            const githubToken = await getGithubTokens(req)
            body.source.repository.authorizationInfo.parameters.AccessToken = githubToken.token;
        }
        try {
            await axios.post(uri, body, {
                headers: {
                    "Authorization": headers.vstsauthorization,
                    "Content-Type": "application/json",
                    "accept": "application/json;api-version=4.1-preview.1"
                }
            });
            res.sendStatus(200);
        }
        catch (err) {
            res.send(err);
        }
        // const tokenData = await getGithubTokens(req);
        // if (!tokenData.authenticated) {
        //     LogHelper.warn('github-passthrough-unauthorized', {});
        //     res.sendStatus(401);
        // }
        // try {
        //     const response = await axios.get(req.body.url, {
        //         headers: {
        //             Authorization: `Bearer ${tokenData.token}`
        //         }
        //     });
        //     res.json(response.data);
        // } catch (err) {
        //     LogHelper.error('github-passthrough', err);
        //     res.send(err.response);
        // }
    });
}