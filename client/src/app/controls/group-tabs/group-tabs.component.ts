import {
    Component,
    OnChanges,
    ElementRef,
    ViewChild,
    Input,
    SimpleChanges,
    Output,
    EventEmitter,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { KeyCodes } from '../../shared/models/constants';
import { Dom } from '../../shared/Utilities/dom';

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
export class GroupTabsComponent implements OnChanges {
    @ViewChild('groupTabs') groupTabs: ElementRef;
    @Input() control: FormControl;
    @Input() tabs: GroupTab[];
    @Input() groupId: string;
    @Output() valueChanged: EventEmitter<string>;

    public selectedTabId: string;
    private _originalTabId: string;

    constructor() {
        this.valueChanged = new EventEmitter<string>();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['control']) {
            this._originalTabId = this.control.value;
            this.selectedTabId = this.control.value;
        }
    }

    onKeyDown(event: KeyboardEvent) {
        if (event.keyCode === KeyCodes.arrowRight || event.keyCode === KeyCodes.arrowLeft) {
            let curIndex = this.tabs.findIndex(tab => tab.id === this.selectedTabId);
            const tabElements = this._getTabElements();
            this._updateTabFocus(false, tabElements, curIndex);

            if (event.keyCode === KeyCodes.arrowRight) {
                curIndex = this._getTargetIndex(curIndex + 1);
            } else {
                curIndex = this._getTargetIndex(curIndex - 1);
            }

            this._setSelectedValue(this.tabs[curIndex].id);
            this._updateTabFocus(true, tabElements, curIndex);

            event.preventDefault();
        }
    }

    select(value: string) {
        this._setSelectedValue(value);
    }

    private _setSelectedValue(value: string) {
        if (value !== this._originalTabId) {
            this.control.markAsDirty();
        } else {
            this.control.markAsPristine();
        }

        this.control.setValue(value);
        this.selectedTabId = value;
        this.valueChanged.next(value);
    }

    private _getTabElements() {
        return this.groupTabs.nativeElement.children;
    }

    private _updateTabFocus(set: boolean, elements: HTMLCollection, index: number) {
        const tab = Dom.getTabbableControl(<HTMLElement>elements[index]);

        if (set) {
            Dom.setFocus(tab);
        } else {
            Dom.clearFocus(tab);
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
