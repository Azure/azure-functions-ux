import {Http} from 'angular2/http';
import {Injectable} from 'angular2/core';
import {FunctionInfo} from './function-info';
import {VfsObject} from './vfs-object';

@Injectable()
export class FunctionsService {
    constructor(private _http: Http) { }

    getFunctions() {
        return this._http.get('/mocks/functions.json')
            .map<FunctionInfo[]>(r => r.json());
    }

    getFunctionContent(functionInfo: FunctionInfo) {
        return this._http.get('/mocks/' + functionInfo.name + '.vfs.json')
            .map<VfsObject[]>(r => r.json());
    }

    getFileContent(file: VfsObject) {
        return this._http.get(file.href)
            .map<string>(r => r.text());
    }
}