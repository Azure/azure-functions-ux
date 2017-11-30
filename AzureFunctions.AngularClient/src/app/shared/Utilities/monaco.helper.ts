import { ElementRef, QueryList } from '@angular/core';
import { MonacoEditorDirective } from '../directives/monaco-editor.directive';

export namespace MonacoHelper {

  export function onResize(container: ElementRef, editorContainer: ElementRef, editor: MonacoEditorDirective) {
    const nameHeight = 46;
    const editorPadding = 25;

    let containerWidth;
    let containerHeight;

    if (container) {
        containerWidth = window.innerWidth - container.nativeElement.getBoundingClientRect().left;
        containerHeight = window.innerHeight - container.nativeElement.getBoundingClientRect().top;
    }
    const rightPadding = 50;
    const bottomPadding = 50;

    const editorContainerWidth = Math.max(622.5, containerWidth - rightPadding);
    const editorContainerHeight = Math.max(750, containerHeight - bottomPadding - nameHeight - editorPadding);

    if (editorContainer) {
        editorContainer.nativeElement.style.width = editorContainerWidth + 'px';
        editorContainer.nativeElement.style.height = editorContainerHeight + 'px';
    }

    if (editor) {
        editor.setLayout(
            editorContainerWidth - 2,
            editorContainerHeight - 2
        );
    }
  }

  export function onResizeFunction( functionContainer: ElementRef,
                                    editorContainer: ElementRef,
                                    rightContainer: ElementRef,
                                    bottomContainer: ElementRef,
                                    rightTab: string,
                                    bottomTab: string,
                                    expandLogs: Boolean,
                                    isHttpFunction: Boolean,
                                    testDataEditor: MonacoEditorDirective,
                                    codeEditor: MonacoEditorDirective) {
    const functionNameHeight = 46;
    const editorPadding = 25;

    let functionContainerWidth;
    let functionContainerHeight;
    if (functionContainer) {
        functionContainerWidth = window.innerWidth - functionContainer.nativeElement.getBoundingClientRect().left;
        functionContainerHeight = window.innerHeight - functionContainer.nativeElement.getBoundingClientRect().top;
    }
    const rightContainerWidth = rightTab ? Math.floor((functionContainerWidth / 3)) : 50;
    let bottomContainerHeight = bottomTab ? Math.floor((functionContainerHeight / 3)) : 50;

    const editorContainerWidth = functionContainerWidth - rightContainerWidth - 50;
    let editorContainerHeight = functionContainerHeight - bottomContainerHeight - functionNameHeight - editorPadding;

    if (expandLogs) {
        editorContainerHeight = 0;

        bottomContainerHeight = functionContainerHeight - functionNameHeight;

        editorContainer.nativeElement.style.visibility = 'hidden';
        bottomContainer.nativeElement.style.marginTop = '0px';
    } else {
        editorContainer.nativeElement.style.visibility = 'visible';
        bottomContainer.nativeElement.style.marginTop = '25px';
    }

    if (editorContainer) {
        editorContainer.nativeElement.style.width = editorContainerWidth + 'px';
        editorContainer.nativeElement.style.height = editorContainerHeight + 'px';
    }

    if (codeEditor) {
        codeEditor.setLayout(
            editorContainerWidth - 2,
            editorContainerHeight - 2
        );
    }

    if (rightContainer) {
        rightContainer.nativeElement.style.width = rightContainerWidth + 'px';
        rightContainer.nativeElement.style.height = functionContainerHeight + 'px';
    }

    if (bottomContainer) {
        bottomContainer.nativeElement.style.height = bottomContainerHeight + 'px';
        bottomContainer.nativeElement.style.width = (editorContainerWidth + editorPadding * 2) + 'px';
    }

    if (testDataEditor) {
        const widthDataEditor = rightContainerWidth - 24;

        setTimeout(() => {
            if (testDataEditor) {
                testDataEditor.setLayout(
                    rightTab ? widthDataEditor : 0,
                    isHttpFunction ? 230 : functionContainerHeight / 2
                );
            }
        }, 0);
    }
  }

  export function getMonacoDirective(id: string, monacoEditors: QueryList<MonacoEditorDirective>): MonacoEditorDirective {
    if (!monacoEditors) {
        return null;
    }

    return monacoEditors.toArray().find((e) => {
        return e.elementRef.nativeElement.id === id;
    });
  }
}
