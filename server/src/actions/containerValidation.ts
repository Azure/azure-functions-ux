import { Request, Response } from 'express';
import Axios from 'axios';

export interface ProxyRequest<T> {
    body: T;
    headers: { [name: string]: string };
    method: string;
    url: string;
}

export interface GetRepositoryTagRequest {
    baseUrl: string;
    platform: string;
    repository: string;
    tag: string;
    username: string;
    password: string;
}

export async function validateContainerImage(req: Request, res: Response) {
    const proxyPayload = req.body as ProxyRequest<GetRepositoryTagRequest>;
    
    try {
        await Axios.post(proxyPayload.url, proxyPayload.body, {
            headers: proxyPayload.headers
        });

        res.status(200).send({});
    } catch (e) {
        if (e.response && e.response.status) {
            let message = e.message;
            if (e.response.data && e.response.data.content) {
                const error = JSON.parse(e.response.data.content);
                if (error.errors && error.errors[0]) {
                    res.status(e.response.status).send(error.errors[0].message);
                }
            } else {
                res.status(e.response.status).send(message);
            }
        } else if (e.request) {
            res.status(400).send({
                reason: 'ContainerValidationError',
                error: 'request error'
            });
        } else {
            res.status(e.code).send({
                reason: 'ContainerValidationError',
                error: e.code
            });
        }
    }
}