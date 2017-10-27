import axios from 'axios';

import { Request, Response } from 'express';

import * as safeJson from 'circular-json';

interface ProxyRequest {
    body: string;
    headers: { [name: string]: string };
    method: string;
    url: string;
}

export function proxy(req: Request, res: Response) {
    const content = req.body as ProxyRequest;
    const request = {
        method: content.method,
        data: content.body,
        headers: content.headers,
        url: content.url
    };
    axios.request(request)
        .then(r => res.send(r.data))
        .catch(e => {
            if (e.response && e.response.status) {
                res.status(e.response.status).send(safeJson.stringify(e));
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
