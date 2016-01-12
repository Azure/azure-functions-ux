import {Component, OnInit} from 'angular2/core';
import {FunctionInfo} from './function-info';
import {RouterLink, Router, RouteParams} from 'angular2/router';

@Component({
    selector: 'sidebar',
    templateUrl: 'templates/sidebar.html',
    inputs: ['functionsInfo'],
    directives: [RouterLink, Router, RouteParams]
})
export class SideBarComponent {
    public functionsInfo: FunctionInfo[];
    public selectedFunctionName: string;
    public selectedFunction: FunctionInfo;
    constructor(
      private _router: Router,
      routeParams: RouteParams
    ) {
      this.selectedFunction = this.functionsInfo.find(e => e.name === routeParams.get('functionName'));
    }

    onSelect(fi: FunctionInfo){
        this._router.navigate( ['Functions', { functionName: fi.name }] );
    }
}