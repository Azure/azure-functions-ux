import { Directive, Input, ElementRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/switchMap';

import { FunctionApp } from './../function-app';
import { FunctionAppEditMode } from "../models/function-app-edit-mode";

@Directive({
  selector: '[fnWriteAccess]',
})
export class FnWriteAccessDirective {

    functionAppStream: Subject<FunctionApp>;

    @Input('fnWriteAccess') set functionApp (value) {
        this.functionAppStream.next(value);
    }

    constructor(private elementRef: ElementRef) {
        this.functionAppStream = new Subject<FunctionApp>();

        this.functionAppStream
            .debounceTime(100)
            .switchMap(fa => fa.getFunctionAppEditMode())
            .subscribe(editMode => {
                if (editMode === FunctionAppEditMode.ReadOnly || editMode === FunctionAppEditMode.ReadOnlySourceControlled) {
                    this.elementRef.nativeElement.style.pointerEvents = 'none';
                    this.elementRef.nativeElement.disabled = true;
                    if (!this.elementRef.nativeElement.hasAttribute('monacoEditor')) {
                        this.elementRef.nativeElement.style.opacity = '0.2';
                    }
                }
            });
    }
}
