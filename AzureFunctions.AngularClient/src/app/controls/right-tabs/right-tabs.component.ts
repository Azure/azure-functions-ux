import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'right-tabs',
  templateUrl: './right-tabs.component.html',
  styleUrls: ['./right-tabs.component.scss']
})
export class RightTabsComponent implements OnInit {

  expanded = false;

  constructor() { }

  ngOnInit() {
  }

  toggleExpanded(){
    this.expanded = !this.expanded;
  }

}
