import { GlobalStateService } from './../shared/services/global-state.service';
import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import {ArmService} from '../shared/services/arm.service';
import {TreeNode} from './tree-node';

@Component({
    selector: 'tree-view',
    templateUrl: './tree-view.component.html',
    styleUrls: ['./tree-view.component.scss'],
    inputs: ['node', 'levelInput']
})

export class TreeViewComponent{
    node : TreeNode;
    margin : string;
    level : number;

    public showTryView = false;

    constructor(globalStateService : GlobalStateService) {
        this.showTryView = globalStateService.showTryView;
    }

    set levelInput(level : number){
        if(level >= 1){
            let margin = level * 11;
            this.margin = margin + "px";
        }
        else{
            this.margin = "5px";
        }

        this.level = level;
    }
}