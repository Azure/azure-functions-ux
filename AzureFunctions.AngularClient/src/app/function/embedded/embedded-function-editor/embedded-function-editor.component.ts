import { MonacoEditorDirective } from './../../../shared/directives/monaco-editor.directive';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FunctionApp } from 'app/shared/function-app';
import { AfterContentInit } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'embedded-function-editor',
  templateUrl: './embedded-function-editor.component.html',
  styleUrls: ['./embedded-function-editor.component.scss']
})
export class EmbeddedFunctionEditorComponent implements OnInit, AfterContentInit {

  @ViewChild('codeContainer') codeContainer: ElementRef;
  @ViewChild(MonacoEditorDirective) codeEditor: MonacoEditorDirective;
  functionApp: FunctionApp = null;  // Only here because monaco directive requires it

  constructor() { }

  ngOnInit() {
    // this.onResize();
  }

  ngAfterContentInit(){
    setTimeout(() =>{
      this.onResize();
    });
  }

  onResize(){
    const width = this.codeContainer.nativeElement.clientWidth;
    const height = this.codeContainer.nativeElement.clientHeight;
    this.codeEditor.setLayout(width - 4, height - 4);
    // this.codeEditor.setLayout(100, 100);
  }
}
