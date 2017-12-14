import { MonacoEditorDirective } from './../../../shared/directives/monaco-editor.directive';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AfterContentInit } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'embedded-function-editor',
  templateUrl: './embedded-function-editor.component.html',
  styleUrls: ['./embedded-function-editor.component.scss']
})
export class EmbeddedFunctionEditorComponent implements OnInit, AfterContentInit {

  @ViewChild('codeContainer') codeContainer: ElementRef;
  @ViewChild(MonacoEditorDirective) codeEditor: MonacoEditorDirective;

  private _rightBarExpandedWidth = 460;
  private _rightBarClosedWidth = 44;
  private _bottomBarClosedHeight = 39;
  private _bottomBarExpandedHeight = 300;


  constructor() { }

  ngOnInit() {
    // this.onResize();
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.onResize();
    });
  }

  onResize() {
    const width = this.codeContainer.nativeElement.clientWidth;
    const height = this.codeContainer.nativeElement.clientHeight;

    this.codeEditor.setLayout(width - 50, height - 50);
  }

  handleRightBarExpansion(isExpanded: boolean) {

    const parentElement = this.codeContainer.nativeElement.parentElement;
    if (isExpanded) {
      parentElement.style.width = `calc(100% - ${this._rightBarExpandedWidth + 1}px)`;
    } else {
      parentElement.style.width = `calc(100% - ${this._rightBarClosedWidth + 1}px)`;
    }

    setTimeout(() => {
      this.onResize();
    });

  }

  handleBottomBarExpansion(isExpanded: boolean) {

    const parentElement = this.codeContainer.nativeElement.parentElement;
    if (isExpanded) {
      parentElement.style.height = `calc(100% - ${this._bottomBarExpandedHeight + 1}px)`;
    } else {
      parentElement.style.height = `calc(100% - ${this._bottomBarClosedHeight + 1}px)`;
    }

    setTimeout(() => {
      this.onResize();
    });

  }
}
