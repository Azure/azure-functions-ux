import { User } from './../types/user';
import { Request, Response } from 'express';
import axios from 'axios';
import * as uuid4 from 'uuid/v4';

import { config } from '../config';
import { constants } from "../constants";

export function getTenants(req: Request, res: Response) {
    const user = req.user as User;
    if (req.host === 'localhost') {
        const headers = {
            'Authorization': `Bearer ${user.token.access_token}`
        };

        axios.get(`${config.azureResourceManagerEndpoint}/tenants?api-version=2017-06-01`, { headers: headers })
            .then(r => {
                const tenants = r.data
                    .value
                    .map((t: { tenantId: string }) => ({
                        DisplayName: t.tenantId,
                        DomainName: t.tenantId,
                        TenantId: t.tenantId,
                        Current: t.tenantId.toUpperCase() === user.tid.toUpperCase()
                    }));
                res.json(tenants);
            })
            .catch(err => res.status(500).send(err));
    } else {
        // TODO: implement getTenants for Azure
        res.status(501).send('Not Implemented for Azure');
    }
}

export function switchTenant(req: Request, res: Response) {
    const { tenantId } = req.params;
    if (tenantId) {
        const url = 'https://login.microsoftonline.com/' + tenantId + '/oauth2/authorize' +
            '?response_type=id_token code' +
            `&redirect_uri=${constants.authentication.redirectUrl}` +
            `&client_id=${process.env.AADClientId}` +
            `&resource=${constants.authentication.resource}` +
            `&scope=${constants.authentication.scope}` +
            // This is just for localhost.
            // TODO: figure out what tenant switching means for OnPrem.
            // TODO: investigate using same nonce logic as the adal package.
            `&nonce=${uuid4()}` +
            '&site_id=500879' +
            `&response_mode=query` +
            `&state=`;
        res.redirect(url);
    } else {
        res.status(400).send('tenantId not specified.');
    }
}

export function getToken(req: Request, res: Response) {
    const user = req.user as User;
    if (req.query.plaintext) {
        res.send(user.token.access_token);
    } else {
        res.json(user);
    }
}