import {VfsObject} from '../models/vfs-object';
import {FunctionInfo, FunctionSecrets} from '../models/function-info';
import {ScmInfo} from '../models/scm-info';
import {FunctionTemplate} from '../models/function-template';
import {RunResponse} from '../models/run-response';
import {Observable} from 'rxjs/Observable';
import {DesignerSchema} from '../models/designer-schema';

export interface IFunctionsService {
    initializeUser(): Observable<ScmInfo>;
    getFunctions(): Observable<FunctionInfo[]>;
    getFunctionContent(functionInfo: FunctionInfo): Observable<VfsObject[]>;
    getFileContent(file: VfsObject): Observable<string>;
    saveFile(file: VfsObject, updatedContent: string): Observable<VfsObject>;
    getTemplates(): Observable<FunctionTemplate[]>;
    createFunction(functionName: string, templateId: string): Observable<string>;
    getNewFunctionNode(): FunctionInfo;
    getSettingsNode(): FunctionInfo;
    getNewFileObject(functionInfo: FunctionInfo): VfsObject;
    getTestData(functionInfo: FunctionInfo): Observable<VfsObject>;
    runFunction(functionInfo: FunctionInfo, content: string): Observable<string>;
    getRunStatus(functionInfo: FunctionInfo, runId: string): Observable<string>;
    deleteFunction(functionInfo: FunctionInfo): Observable<string>;
    getDesignerSchema(): Observable<DesignerSchema>;
    warmupMainSite();
    getSecrets(fi: FunctionInfo): Observable<FunctionSecrets>;
    setSecrets(fi: FunctionInfo, secrets: FunctionSecrets): Observable<FunctionSecrets>;
    getFunctionInvokeUrl(fi: FunctionInfo): string;
}