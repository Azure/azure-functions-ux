import { Request, Response } from 'express';
const resources = require('./resources.en.json');
const bindingConfig = require('./binding-config.json');

export function getBindingConfig(_: Request, res: Response) {
    res.json(bindingConfig);
}


export function getResources(_: Request, res: Response) {
    res.json(resources);
}

export function getRuntimeVersion(_: Request, res: Response) {
    res.json('~1');
}

export function getRoutingVersion(_: Request, res: Response) {
    res.json('~0.2');
}