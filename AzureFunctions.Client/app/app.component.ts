import {Component, OnInit} from 'angular2/core';
import {SideBarComponent} from './sidebar.component';
import {TopBarComponent} from './top-bar.component';
import {AceEditorDirective} from './ace-editor.directive';
import {FunctionDetailsComponent} from './function-details.component';
import {FunctionsService} from './functions.service';
import {FunctionInfo} from './function-info';
import {VfsObject} from './vfs-object';

@Component({
    selector: 'azure-functions-app',
    templateUrl: 'templates/app.html',
    directives: [SideBarComponent, TopBarComponent, AceEditorDirective],
})
export class AppComponent implements OnInit{
    public functionsInfo: FunctionInfo[];
    public selectedFunction: FunctionInfo;
    public selectedFile: VfsObject;

    constructor(private _functionsService: FunctionsService) { }

    ngOnInit() {
        this._functionsService.initializeUser()
            .subscribe(r => this._functionsService.getFunctions()
              .subscribe(res => {
                /*res.unshift({
                  name: "Settings",
                  href: 'https://' + r.scm_url + '/api/site/wwwroot/app_data/jobs/functions',
                  config: null,
                  config_href: null,
                  expanded: false,
                  files: null,
                  script_href: null,
                  script_root_path: null,
                  template_id: null,
                  test_data_href: null
                });
                res.unshift({
                  name: 'New Function',
                  href: null,
                  config: null,
                  config_href: null,
                  expanded: false,
                  files: null,
                  script_href: null,
                  script_root_path: null,
                  template_id: null,
                  test_data_href: null
                });*/
                this.functionsInfo = res
              }));
    }

    onFunctionSelect(functionInfo: FunctionInfo){
        this.selectedFunction = functionInfo;
        if (functionInfo.name === 'New Function') {
            delete this.selectedFile;
        }
    }

    onFileSelect(file: VfsObject) {
        this.selectedFile = file;
    }
}