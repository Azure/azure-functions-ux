import { Subject } from 'rxjs/Subject';
import { FunctionApp } from 'app/shared/function-app';
import { Component, Output, OnInit } from '@angular/core';

@Component({
  selector: 'bottom-tabs',
  templateUrl: './bottom-tabs.component.html',
  styleUrls: ['./bottom-tabs.component.scss']
})
export class BottomTabsComponent implements OnInit {
  @Output() onExpanded = new Subject<boolean>();

  functionApp: FunctionApp = null;
  expanded = false;

  constructor() { }

  ngOnInit() {
  }

  toggleExpanded() {
    this.expanded = !this.expanded;
    this.onExpanded.next(this.expanded);
  }

}
