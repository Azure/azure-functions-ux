import {Http} from 'angular2/http';
import {Injectable} from 'angular2/core';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {ScmInfo} from '../models/scm-info';
import {IFunctionsService} from './ifunctions.service';
import {Observable} from 'rxjs/Rx';
import {FunctionTemplate} from '../models/function-template';
import {DesignerSchema} from '../models/designer-schema';
import {FunctionSecrets} from '../models/function-secrets';
import {Subscription} from '../models/subscription';
import {HostSecrets} from '../models/host-secrets';
import {BindingConfig} from '../models/binding';
import {FunctionContainer} from '../models/function-container';

@Injectable()
export class MockFunctionsService implements IFunctionsService {
    private scmInfo: ScmInfo;
    private hostSecrets: HostSecrets;

    constructor(private _http: Http) { }

    setFunctionContainer(fc: FunctionContainer) {
        
    }

    isInitialized() {
        return true;
    }

    initializeUser() {
        return this._http.get('mocks/scmInfo.json')
            .map<ScmInfo>(r => {
                this.scmInfo = r.json();
                return this.scmInfo;
            });
    }

    createFunctionsContainer(subscriptionId: string, region: string, serverFarmId?: string) {
        return this.initializeUser();
    }

    getFunctions() {
        return this._http.get('mocks/functions.json')
            .map<FunctionInfo[]>(r => r.json());
    }

    getFunctionContent(functionInfo: FunctionInfo) {
        return this._http.get(`mocks/${functionInfo.name}.vfs.json`)
            .map<any>(r => {
                return {
                    files: r.json(),
                    functionInfo: functionInfo
                };
            });
    }

    getFileContent(file: VfsObject | string) {
        return this._http.get(typeof file === 'string' ? file : file.href)
            .map<string>(r => r.text());
    }

    saveFile(file: VfsObject, updatedContent: string) {
        console.log(file);
        console.log(updatedContent);
        return Observable.of(file);
    }

    createFunction(functionName: string, templateId: string) {
        console.log(functionName);
        console.log(templateId);
        return Observable.of({name: functionName});
    }

    createFunctionV2(functionName: string, files: any) {
        console.log(functionName);
        return Observable.of({ name: functionName });
    }

    getTemplates() {
        return this._http.get('mocks/functionTemplates.json')
            .map<FunctionTemplate[]>(r => r.json());

        //return this._http.get('mocks/templates.json')
        //    .map<FunctionTemplate[]>(r => {
        //        return r.json();
        //    });
    }

    getNewFunctionNode(): FunctionInfo {
        return {
            name: 'New Function',
            href: null,
            config: null,
            script_href: null,
            template_id: null,
            test_data_href: null,
            clientOnly: true,
            isDeleted: false,
            secrets_file_href: null,
            test_data: null
        };
    }

    getSettingsNode(): FunctionInfo {
        return {
            name: "Settings",
            href: null,
            config: null,
            script_href: 'mocks/host/host.json',
            template_id: null,
            test_data_href: null,
            clientOnly: true,
            isDeleted: false,
            secrets_file_href: null,
            test_data: null
        };
    }

    getLogStreamingNode() {
        return {
            name: 'Log Streaming',
            href: null,
            config: null,
            script_href: null,
            template_id: null,
            test_data_href: null,
            clientOnly: true,
            isDeleted: false,
            secrets_file_href: null,
            test_data: null
        };
    }

    getTestData(functionInfo: FunctionInfo) {
        return Observable.of('sample test data');
    }

    getRunStatus(functionInfo: FunctionInfo, runId: string) {
        return Observable.of(`status returned for ${functionInfo.name} run: ${runId}`);
    }

    runFunction(functionInfo: FunctionInfo, content: string) {
        console.log(functionInfo);
        console.log(content);
        return Observable.of("ran");
    }

    deleteFunction(functionInfo: FunctionInfo) {
        return Observable.of('Ok');
    }

    getDesignerSchema() {
        return this._http.get('mocks/function-json-schema.json')
            .map<DesignerSchema>(r => r.json());
    }

    warmupMainSite() {
        console.log('warming up site');
    }

    getSecrets(fi: FunctionInfo) {
        return Observable.of({ key: 'random'});
    }

    setSecrets(fi: FunctionInfo, secrets: FunctionSecrets) {
        return Observable.of(secrets);
    }

    getFunctionInvokeUrl(fi: FunctionInfo) {
        return `scm/${fi.name}`;
    }

    saveFunction(fi: FunctionInfo, config: any) {
        return Observable.of({
            config: config,
            name: fi.name,
            script_href: fi.script_href,
            test_data_href: fi.test_data_href,
            secrets_file_href: fi.secrets_file_href,
            href: fi.href,
            template_id: fi.template_id,
            clientOnly: fi.clientOnly,
            isDeleted: fi.isDeleted
        });
    }

    getFunction(fi: FunctionInfo) {
        return Observable.of(fi);
    }

    getScmUrl() {
        return this.scmInfo.scm_url;
    }

    getDefaultStorageAccount() {
        for (var key in this.scmInfo.appSettings) {
            if (key.toString().endsWith("_STORAGE")) {
                return key;
            }
        }

        return "";
    }

    getConfig() {
        return Observable.of({});
    }

    getBearerHeader() {
        return 'Bearer token';
    }

    getBasicHeader() {
        return 'Basic Token';
    }

    getSubscriptions() {
        return this._http.get('mocks/subscriptions.json')
            .map<Subscription[]>(r => r.json());
    }

    getBindingConfig(): Observable<BindingConfig> {
        return this._http.get('mocks/bindings.json')
            .map<BindingConfig>(r => {
                return r.json();
            });
    }

    getHostSecrets() {
        return this._http.get('mocks/host-secrets.json')
            .map<HostSecrets>(r => r.json())
            .subscribe(h => this.hostSecrets = h,
                       e => console.log(e));
    }

    createTrialFunctionsContainer() {
        return Observable.of('done'); 
    }

    updateFunction(fi: FunctionInfo) {
        console.log(fi);
        return Observable.of(fi);
    }

    redirectToIbizaIfNeeded() {
        console.log('redirectToIbizaIfNeeded');
    }

    getFunctionErrors(fi: FunctionInfo) {
        return Observable.of(['error']);
    }

    getHostErrors() {
        return Observable.of(['error']);
    }
}