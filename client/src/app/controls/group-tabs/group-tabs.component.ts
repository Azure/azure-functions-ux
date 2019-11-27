import { Component, OnChanges, ElementRef, ViewChild, Input, SimpleChanges, Output, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { KeyCodes } from '../../shared/models/constants';
import { Dom } from '../../shared/Utilities/dom';
import { Subject } from 'rxjs/Subject';

export interface GroupTab {
  title: string;
  id: string;
  iconUrl: string;
  description: string;
}

@Component({
  selector: 'group-tabs',
  templateUrl: './group-tabs.component.html',
  styleUrls: ['./group-tabs.component.scss'],
})
export class GroupTabsComponent implements AfterViewInit, OnChanges {
  @ViewChild('groupTabs')
  groupTabs: ElementRef;
  @Input()
  control: FormControl;
  @Input()
  tabs: GroupTab[];
  @Input()
  groupId: string;
  @Input()
  selectedTabId: string;
  @Output()
  valueChanged: Subject<string>;

  public currentTabId: string;
  public groupTabClasses = 'clickable group-tab group-tab-width-3-tabs';
  private _originalTabId: string;

  constructor() {
    this.valueChanged = new Subject<string>();
  }

  ngAfterViewInit() {
    this._setFocusOnSelectedTab();
  }

  ngOnChanges(changes: SimpleChanges) {
    let selectedTabId: string;

    if (changes['selectedTabId']) {
      selectedTabId = this.selectedTabId;
    }

    if (changes['control']) {
      selectedTabId = this.control.value;
    }

    // NOTE(michinoy): As of right now the only two places using group tab is spec picker
    // and container configuration. Turns container configuration could have either 2
    // or 3 tabs. Thus drawing the UX as needed.
    if (changes['tabs']) {
      this.groupTabClasses =
        this.tabs.length == 2 ? 'clickable group-tab group-tab-width-2-tabs' : 'clickable group-tab group-tab-width-3-tabs';
    }

    if (selectedTabId) {
      this._originalTabId = selectedTabId;
      this.currentTabId = selectedTabId;
      this._setFocusOnSelectedTab();
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.keyCode === KeyCodes.arrowRight || event.keyCode === KeyCodes.arrowLeft) {
      let curIndex = this.tabs.findIndex(tab => tab.id === this.currentTabId);
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
    this.currentTabId = tabId;
    this.valueChanged.next(tabId);
  }

  private _setFocusOnSelectedTab() {
    const curIndex = this.tabs.findIndex(tab => tab.id === this.currentTabId);
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
