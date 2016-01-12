import {Component, OnInit} from 'angular2/core';
import {FunctionInfo} from './function-info';

@Component({
    selector: 'sidebar',
    templateUrl: 'templates/sidebar.html',
    inputs: ['functionsInfo']
})
export class SideBarComponent {
    public functionsInfo: FunctionInfo[];
    public selectedFunction: FunctionInfo;
    onSelect(fi: FunctionInfo){
        this.selectedFunction = fi;
    }
}