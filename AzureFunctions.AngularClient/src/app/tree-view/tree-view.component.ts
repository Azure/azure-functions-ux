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

    constructor(private _armService : ArmService) {
    }

    set levelInput(level : number){
        let margin = level * 10 + 5;
        this.margin = margin + "px";

        // if(level > 1){
        //     let margin = level * 10 + 5;
        //     this.margin = margin + "px";
        // }
        // else if(level === 1){
        //     this.margin = "15px";
        // }
        // else{
        //     this.margin = "10px";
        // }

        this.level = level;
    }
}