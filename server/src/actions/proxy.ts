import axios from 'axios';

import { Request, Response } from 'express';

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
            res.status(e.status).send(e);
        });
}
