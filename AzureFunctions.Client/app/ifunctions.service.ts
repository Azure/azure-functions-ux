import {VfsObject} from './vfs-object';
import {FunctionInfo} from './function-info';
import {ScmInfo} from './scm-info';
import {Observable} from 'rxjs/Observable';

export interface IFunctionsService {
    initializeUser(): Observable<ScmInfo>;
    getFunctions(): Observable<FunctionInfo[]>;
    getFunctionContent(functionInfo: FunctionInfo): Observable<VfsObject[]>;
    getFileContent(file: VfsObject): Observable<string>;
    saveFile(file: VfsObject, updatedContent: string): Observable<string>;
}