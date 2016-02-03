import {Component, OnInit} from 'angular2/core';
import {SideBarComponent} from './sidebar.component';
import {TopBarComponent} from './top-bar.component';
import {NewFunctionComponent} from './new-function.component';
import {FunctionEditComponent} from './function-edit.component';
import {FunctionsService} from '../services/functions.service';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {FunctionTemplate} from '../models/function-template';
import {ScmInfo} from '../models/scm-info';
import {Subscription} from '../models/subscription';


@Component({
    selector: 'azure-functions-app',
    templateUrl: 'templates/app.html',
    directives: [SideBarComponent, TopBarComponent, NewFunctionComponent, FunctionEditComponent]
})
export class AppComponent implements OnInit{
    public functionsInfo: FunctionInfo[];
    public subscriptions: Subscription[];
    public selectedSubscription: string;
    public functionTemplates: FunctionTemplate[];
    public selectedFunction: FunctionInfo;
    public deleteSelectedFunction: boolean;
    public addedFunction: FunctionInfo;
    public noContainerFound: boolean;
    private initializing: boolean;

    constructor(private _functionsService: FunctionsService) {
        this.noContainerFound = false;
    }

    ngOnInit() {
        this.initializing = true;
        this._functionsService.initializeUser()
            .subscribe(r => {
                if (!r) {
                    // No Container. Ask the user to pick.
                    //get a list of subs and ask the user to chose.
                    this.initializing = false;
                    this.noContainerFound = true;
                    this._functionsService.getSubscriptions()
                        .subscribe(res => {
                            res.sort((a, b) => a.displayName.localeCompare(b.displayName));
                            this.subscriptions = res
                        });
                } else {
                    this.initFunctions();
                }
            });
    }

    initFunctions() {
        this.noContainerFound = false;
        this._functionsService.getFunctions()
            .subscribe(res => {
                res.unshift(this._functionsService.getNewFunctionNode());
                res.unshift(this._functionsService.getSettingsNode());
                this.functionsInfo = res;
                this.initializing = false;
            });
        this._functionsService.getTemplates()
            .subscribe(res => this.functionTemplates = res);
        this._functionsService.warmupMainSite();
    }

    onFunctionAdded(fi: FunctionInfo) {
        this.addedFunction = fi;
    }

    onFunctionSelect(functionInfo: FunctionInfo){
        this.selectedFunction = functionInfo;
    }

    onDeleteSelectedFunction(deleteSelectedFunction: boolean) {
        this.deleteSelectedFunction = deleteSelectedFunction;
        if (deleteSelectedFunction) {
            this.selectedFunction = null;
        }
    }

    createFunctionsContainer() {
        this.initializing = true;
        this._functionsService.createFunctionsContainer(this.selectedSubscription)
            .subscribe(r => this.initFunctions());
    }

}