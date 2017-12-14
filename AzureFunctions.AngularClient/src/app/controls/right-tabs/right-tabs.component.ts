import { Subject } from 'rxjs/Subject';
import { FunctionApp } from 'app/shared/function-app';
import { MonacoEditorDirective } from './../../shared/directives/monaco-editor.directive';
import { Component, OnInit, ViewChild, ElementRef, AfterContentInit, Output } from '@angular/core';

@Component({
  selector: 'right-tabs',
  templateUrl: './right-tabs.component.html',
  styleUrls: ['./right-tabs.component.scss']
})
export class RightTabsComponent implements OnInit, AfterContentInit {
  @ViewChild('requestEditorContainer') requestEditorContainer: ElementRef;
  @ViewChild(MonacoEditorDirective) requestEditor: MonacoEditorDirective;
  @Output() onExpanded = new Subject<boolean>();

  functionApp: FunctionApp = null;
  expanded = false;

  constructor() { }

  ngOnInit() {
  }

  toggleExpanded() {
    this.expanded = !this.expanded;
    this.onExpanded.next(this.expanded);

    if (this.expanded) {
      this.onResize();
    }
  }

  ngAfterContentInit() {
    // this.onResize();
  }

  onResize() {
    setTimeout(() => {
      const width = this.requestEditorContainer.nativeElement.clientWidth;
      const height = this.requestEditorContainer.nativeElement.clientHeight;
      this.requestEditor.setLayout(width - 4, height - 4);
    }, 1000);
  }
}
