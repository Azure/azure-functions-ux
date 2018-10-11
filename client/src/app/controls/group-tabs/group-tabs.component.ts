import {
    Component,
    OnChanges,
    ElementRef,
    ViewChild,
    Input,
    SimpleChanges,
    Output,
    AfterViewInit,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { KeyCodes } from '../../shared/models/constants';
import { Dom } from '../../shared/Utilities/dom';
import { Subject } from 'rxjs/Subject';

export interface GroupTab {
    title: string;
    id: string;
    iconUrl: string;
}

@Component({
    selector: 'group-tabs',
    templateUrl: './group-tabs.component.html',
    styleUrls: ['./group-tabs.component.scss'],
})
export class GroupTabsComponent implements AfterViewInit, OnChanges {
    @ViewChild('groupTabs') groupTabs: ElementRef;
    @Input() control: FormControl;
    @Input() tabs: GroupTab[];
    @Input() groupId: string;
    @Input() defaultTabId: string;
    @Output() valueChanged: Subject<string>;

    public selectedTabId: string;
    private _originalTabId: string;

    constructor() {
        this.valueChanged = new Subject<string>();
    }

    ngAfterViewInit() {
        this._setFocusOnSelectedTab();
    }

    ngOnChanges(changes: SimpleChanges) {
        let selectedTabId: string;

        if (changes['defaultTabId']) {
            selectedTabId = this.defaultTabId;
        }

        if (changes['control']) {
            selectedTabId = this.control.value;
        }

        if (selectedTabId) {
            this._originalTabId = selectedTabId;
            this.selectedTabId = selectedTabId;
            this._setFocusOnSelectedTab();
        }
    }

    onKeyDown(event: KeyboardEvent) {
        if (event.keyCode === KeyCodes.arrowRight || event.keyCode === KeyCodes.arrowLeft) {
            let curIndex = this.tabs.findIndex(tab => tab.id === this.selectedTabId);
            const tabElements = this._getTabElements();
            this._setFocus(false, tabElements, curIndex);

            if (event.keyCode === KeyCodes.arrowRight) {
                curIndex = this._getTargetIndex(curIndex + 1);
            } else {
                curIndex = this._getTargetIndex(curIndex - 1);
            }

            this.select(this.tabs[curIndex].id);
            this._setFocus(true, tabElements, curIndex);

            event.preventDefault();
        }
    }

    select(tabId: string) {
        if (this.control) {
            if (tabId !== this._originalTabId) {
                this.control.markAsDirty();
            } else {
                this.control.markAsPristine();
            }

            this.control.setValue(tabId);
        }
        this.selectedTabId = tabId;
        this.valueChanged.next(tabId);
    }

    private _setFocusOnSelectedTab() {
        const curIndex = this.tabs.findIndex(tab => tab.id === this.selectedTabId);
        const tabElements = this._getTabElements();
        this._setFocus(true, tabElements, curIndex);
    }

    private _getTabElements() {
        return this.groupTabs && this.groupTabs.nativeElement ? this.groupTabs.nativeElement.children : [];
    }

    private _setFocus(set: boolean, elements: HTMLCollection, index: number) {
        if (elements.length > 0) {
            const tab = Dom.getTabbableControl(<HTMLElement>elements[index]);

            if (set) {
                Dom.setFocus(tab);
            } else {
                Dom.clearFocus(tab);
            }
        }
    }

    private _getTargetIndex(currentIndex: number) {
        let targetIndex = 0;
        if (currentIndex < 0) {
            targetIndex = this.tabs.length - 1;
        } else if (currentIndex >= this.tabs.length) {
            targetIndex = 0;
        } else {
            targetIndex = currentIndex;
        }

        return targetIndex;
    }
}
