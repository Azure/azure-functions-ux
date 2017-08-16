import { Request, Response } from 'express';
const templates = require('./templates.1.json');

// import * as fs from 'fs';
// import * as path from 'path';
// import * as async from 'async';
//
// import { FunctionTemplate } from '../types/function-template';
// import { Constants } from '../constants';
//
// export function getTemplates(req: Request, res: Response) {
//     const runtime = req.query['runtime'] || 'default';
//     fs.readdir(path.join(__dirname, 'App_Data/templates'), (err, dirs) => {
//         if (err) {
//             res.status(500).json(err).end();
//         } else {
//             async.map(['function.json', 'metadaata.json'], (fileName, cb) => {
//                 async.map(dirs.map(d => path.join(d, fileName)), fs.readFile, (err, data) => {
//                     if (err) {
//                         cb(err);
//                     } else {
//                         cb(undefined, data);
//                     }
//                 })
//             }, (err, vv) => {
//
//             })
//         }
//     });
//     const templates: FunctionTemplate[]
//     res.json(templates);
// }

export function getTemplates(_: Request, res: Response) {
    res.json(templates);
}