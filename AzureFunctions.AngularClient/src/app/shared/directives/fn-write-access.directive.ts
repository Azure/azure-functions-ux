import { FunctionApp } from './../function-app';
import { Subject } from 'rxjs/Rx';
import { Directive, Input, ElementRef } from '@angular/core';

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
            .switchMap(fa => fa.checkIfDisabled())
            .subscribe(isDisabled => {
                if (isDisabled) {
                    this.elementRef.nativeElement.style.pointerEvents = 'none';
                    this.elementRef.nativeElement.disabled = true;
                    if (!this.elementRef.nativeElement.hasAttribute('monacoEditor')) {
                        this.elementRef.nativeElement.style.opacity = '0.2';
                    }
                }
            });
    }


}
