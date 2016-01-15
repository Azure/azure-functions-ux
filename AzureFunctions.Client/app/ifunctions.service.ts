import {VfsObject} from './vfs-object';
import {FunctionInfo} from './function-info';
import {ScmInfo} from './scm-info';
import {FunctionTemplate} from './function-template';
import {Observable} from 'rxjs/Observable';

export interface IFunctionsService {
    initializeUser(): Observable<ScmInfo>;
    getFunctions(): Observable<FunctionInfo[]>;
    getFunctionContent(functionInfo: FunctionInfo): Observable<VfsObject[]>;
    getFileContent(file: VfsObject): Observable<string>;
    saveFile(file: VfsObject, updatedContent: string): Observable<string>;
    getTemplates(): Observable<FunctionTemplate[]>;
    createFunction(functionName: string, templateId: string): Observable<string>;
    getNewFunctionNode(): FunctionInfo;
    getSettingsNode(): FunctionInfo;
}