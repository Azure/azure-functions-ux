import { Request, Response } from 'express';

export function getConfig(_: Request, res: Response) {
    res.json({
        name: 'getConfig'
    });
}