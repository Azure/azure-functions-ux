import { Request, Response } from 'express';
import * as jsonfromresx from 'jsonfromresx';
const resources = require('./resources.en.json');
const bindingConfig = require('./binding-config.json');

export function getBindingConfig(_: Request, res: Response) {
    res.json(bindingConfig);
}


export function getResources(req: Request, res: Response) {
    const runtime = req.query['runtime'] || 'default';


    res.json(resources);
}

export function getRuntimeVersion(_: Request, res: Response) {
    res.json('~1');
}

export function getRoutingVersion(_: Request, res: Response) {
    res.json('~0.2');
}