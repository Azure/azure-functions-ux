import { GlobalStateService } from './../shared/services/global-state.service';
import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import {ArmService} from '../shared/services/arm.service';
import {TreeNode} from './tree-node';
import { Url } from "app/shared/Utilities/url";

@Component({
    selector: 'tree-view',
    templateUrl: './tree-view.component.html',
    styleUrls: ['./tree-view.component.scss'],
    inputs: ['node', 'levelInput']
})

export class TreeViewComponent {
    node: TreeNode;
    paddingLeft: string;
    level: number;

    public showTryView = false;

    constructor(globalStateService: GlobalStateService) {
        this.showTryView = globalStateService.showTryView;
    }

    set levelInput(level: number) {
        if (level > 2) {
            let padding = level * 10 - 10;
            this.paddingLeft = padding + "px";
        }
        else {
            this.paddingLeft = "10px";
        }
        this.level = level;
    }

    openNewTab() {
        //open a new tab with the rousource information
        let windowLocation : string = `${window.location.hostname}`;
        if (window.location.port) {
            windowLocation += `:${window.location.port}`
        }
        window.open(`https://${windowLocation}/?tabbed=true&rid=${this.node.resourceId}`, '_blank');
        // window.open(`https://localhost:44300/?tabbed=true&rid=${this.node.resourceId}`, '_blank');
        
    }
}