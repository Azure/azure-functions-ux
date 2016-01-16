import {VfsObject} from './vfs-object';
import {FunctionInfo} from './function-info';
import {ScmInfo} from './scm-info';
import {FunctionTemplate} from './function-template';
import {RunResponse} from './run-response';
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
    getNewFileObject(functionInfo: FunctionInfo): VfsObject;
    getTestData(functionInfo: FunctionInfo): Observable<VfsObject>;
    runFunction(functionInfo: FunctionInfo, content: string): Observable<RunResponse>;
    getRunStatus(functionInfo: FunctionInfo, runId: string): Observable<string>;
}