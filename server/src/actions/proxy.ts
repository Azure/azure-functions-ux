import * as request from 'request';

import { Request, Response } from 'express';

interface ProxyRequest {
    body: string;
    headers: { [name: string]: string };
    method: string;
    url: string;
}

export function proxy(req: Request, res: Response) {
    const content = req.body as ProxyRequest;
    request({
        method: content.method,
        uri: content.url,
        headers: content.headers,
        body: content.body,
        agentOptions: {
            keepAlive: true
        },
    }).pipe(res);
}
