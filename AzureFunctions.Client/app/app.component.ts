import {Component, OnInit} from 'angular2/core';
import {SideBarComponent} from './sidebar.component';
import {TopBarComponent} from './top-bar.component';
import {FunctionDetailsComponent} from './function-details.component';
import {FunctionsService} from './functions.service';
import {FunctionInfo} from './function-info';
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';

@Component({
    selector: 'azure-functions-app',
    templateUrl: 'templates/app.html',
    directives: [SideBarComponent, TopBarComponent, ROUTER_DIRECTIVES],
    providers: [FunctionsService]
})
@RouteConfig([
    {path: 'functions/:functionName', name: "FunctionDetails", component: FunctionDetailsComponent}
])
export class AppComponent implements OnInit{
    public functionsInfo: FunctionInfo[];

    constructor(private _functionsService: FunctionsService) { }

    ngOnInit() {
        this._functionsService.getFunctions().then(f => this.functionsInfo = f);
    }
}