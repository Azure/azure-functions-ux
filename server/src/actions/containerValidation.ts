import { Request, Response } from 'express';
import axios from 'axios';

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
        await axios.post(proxyPayload.url, proxyPayload.body, {
            headers: proxyPayload.headers
        });

        res.status(200).send({});
    } catch (e) {
        if (e.response && e.response.status) {
            let message = e.message;
            if (e.response.data && e.response.data.content) {
                parseErrorToResponse(e.response.status, e.response.data.content, res);
            } else {
                res.status(e.response.status).send(message);
            }
        } else if (e.request) {
            res.status(400).send('Request error');
        } else {
            res.status(e.code).send(e.code);
        }
    }
}

function parseErrorToResponse(errorStatus: number, errorContent: any, res: Response) {
    try {
        const error = JSON.parse(errorContent);
        if (error.errors && error.errors[0]) {
            res.status(errorStatus).send(error.errors[0].message);
        } else {
            res.status(errorStatus).send('Error validating image and tag information.')
        }
    } catch (parseError) {
        res.status(400).send(`Could not parse the error payload: ${errorContent}.`);
    }
}