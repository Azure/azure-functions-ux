import axios from 'axios';
import * as https from 'https';
import * as http from 'http';

import { Request, Response } from 'express';

interface ProxyRequest {
    body: string;
    headers: { [name: string]: string };
    method: string;
    url: string;
}

const httpsAgent = new https.Agent({ keepAlive: true });
const httpAgent = new http.Agent({ keepAlive: true })

export function proxy(req: Request, res: Response) {
    const content = req.body as ProxyRequest;
    const request = {
        method: content.method,
        data: content.body,
        headers: content.headers,
        url: content.url,
        httpsAgent: httpsAgent,
        httpAgent: httpAgent
    };
    axios.request(request)
        .then(r => res.send(r.data))
        .catch(e => {
            if (e.response && e.response.status) {
                res.status(e.response.status).send(e.response.data);
            } else if (e.request) {
                res.status(400).send({
                    reason: 'PassThrough',
                    error: 'request error'
                });
            } else {
                res.status(400).send({
                    reason: 'PassThrough',
                    error: e.code
                });
            }
        });
}
