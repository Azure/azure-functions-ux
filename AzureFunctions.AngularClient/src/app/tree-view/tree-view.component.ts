import { KeyCodes } from './../shared/models/constants';
import { TreeNodeIterator } from './tree-node-iterator';
import { Dom } from './../shared/Utilities/dom';
import { SideNavComponent } from './../side-nav/side-nav.component';
import { GlobalStateService } from './../shared/services/global-state.service';
import { Url } from "app/shared/Utilities/url";
import { DashboardType } from "app/tree-view/models/dashboard-type";
import { Component, OnInit, EventEmitter, Input, Output, ViewChild, OnChanges, SimpleChange, ElementRef, AfterContentInit } from '@angular/core';
import { ArmService } from '../shared/services/arm.service';
import { TreeNode } from './tree-node';

@Component({
    selector: 'tree-view',
    templateUrl: './tree-view.component.html',
    styleUrls: ['./tree-view.component.scss']
})

export class TreeViewComponent implements OnChanges, AfterContentInit {
    @Input() node: TreeNode;
    @Input() level: number;

    paddingLeft: string;

    public showTryView = false;
    @ViewChild('item') item: ElementRef;

    constructor(
        globalStateService: GlobalStateService,
        private _sideNavComponent: SideNavComponent) {

        this.showTryView = globalStateService.showTryView;
    }

    ngOnChanges(changes: { [key: string]: SimpleChange }) {
        const nodeChange = changes['node'];
        const levelChange = changes['level'];

        if (nodeChange && this.node) {
            this.node.treeView = this;
        }

        if (levelChange && Number.isInteger(this.level)) {

            if (this.level > 2) {
                const padding = this.level * 10 - 10;
                this.paddingLeft = padding + 'px';
            } else {
                this.paddingLeft = '10px';
            }
        }
    }

    ngAfterContentInit() {
        // When the tree initially loads, we make sure that the "Apps" node
        // is the only node that's initially focus-able.
        if (this.node && this.node.dashboardType === DashboardType.apps) {
            setTimeout(() => {
                Dom.setFocusable(this.item.nativeElement);
            }, 0);
        }
    }

    // Down - Navigates down an item in the tree
    // Up - Navigates up an item in the tree
    // Left - Collapses an item in the tree
    // Right - Expands an item in the tree
    // Enter - Selects the current node in the tree, or selects the current nodes
    //         menu item, like "create new", "refresh", etc...
    onKeyPress(event: KeyboardEvent) {
        if (event.keyCode === KeyCodes.arrowDown) {
            this._moveFocusedItemDown();
        } else if (event.keyCode === KeyCodes.arrowUp) {
            this._moveFocusedItemUp();
        } else if (event.keyCode === KeyCodes.enter) {

            // Need to check if the user hit enter on the tree item, or on a menu item
            // that's contained within the tree item
            if (document.activeElement === this.item.nativeElement) {
                this.node.select();
            } else {
                return;
            }
        } else if (event.keyCode === KeyCodes.arrowRight) {

            if (this.node.showExpandIcon && !this.node.isExpanded) {
                this.node.toggle(event);
            } else {
                this._moveFocusedItemDown();
            }

        } else if (event.keyCode === KeyCodes.arrowLeft) {
            if (this.node.showExpandIcon && this.node.isExpanded) {
                this.node.toggle(event);
            } else {
                this._moveFocusedItemUp();
            }
        }

        if (event.keyCode !== KeyCodes.tab) {
            // Prevents the entire page from scrolling on up/down key press
            event.preventDefault();
        }
    }

    private _moveFocusedItemDown() {

        const nextNode = new TreeNodeIterator(this.node).next();
        if (nextNode) {
            this._clearFocus(this.node);
            this.setFocus(nextNode);
        }
    }

    private _moveFocusedItemUp() {
        const prevNode = new TreeNodeIterator(this.node).previous();
        if (prevNode) {
            this._clearFocus(this.node);
            this.setFocus(prevNode);
        }
    }

    public setFocus(node: TreeNode) {
        Dom.setFocus(node.treeView.item.nativeElement);
        (<HTMLElement>node.treeView.item.nativeElement).setAttribute('aria-selected', 'true');
        node.isFocused = true;
        this.node.sideNav.scrollIntoView();
    }

    private _clearFocus(node: TreeNode) {
        Dom.clearFocus(node.treeView.item.nativeElement);
        (<HTMLElement>node.treeView.item.nativeElement).removeAttribute('aria-selected');
        node.isFocused = false;
    }

    openNewTab() {
        //open a new tab with the rousource information
        let windowLocation : string = `${window.location.hostname}`;
        if (window.location.port) {
            windowLocation += `:${window.location.port}`
        }
        window.open(`https://${windowLocation}/signin?tabbed=true&rid=${this.node.resourceId}`, '_blank');
    }
}