import { FunctionAppService } from 'app/shared/services/function-app.service';
import { FunctionAppContext } from './../function-app-context';
import { EditModeHelper } from './../Utilities/edit-mode.helper';
import { Directive, Input, ElementRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/switchMap';

@Directive({
  selector: '[fnWriteAccess]',
})
export class FnWriteAccessDirective implements OnDestroy {
  functionAppContextStream: Subject<FunctionAppContext>;

  @Input('fnWriteAccess')
  set functionAppContext(value) {
    if (this.functionAppContextStream && !this.functionAppContextStream.closed) {
      this.functionAppContextStream.next(value);
    }
  }

  ngOnDestroy(): void {
    this.functionAppContextStream.complete();
    delete this.functionAppContextStream;
  }

  constructor(private elementRef: ElementRef, functionAppService: FunctionAppService) {
    this.functionAppContextStream = new Subject<FunctionAppContext>();

    this.functionAppContextStream
      .filter(c => !!c)
      .switchMap(c => functionAppService.getFunctionAppEditMode(c))
      .map(result => (result.isSuccessful ? EditModeHelper.isReadOnly(result.result) : false))
      .subscribe(isReadOnly => {
        if (isReadOnly) {
          this.elementRef.nativeElement.style.pointerEvents = 'none';
          this.elementRef.nativeElement.disabled = true;
          this.elementRef.nativeElement.style.opacity = '0.2';
        }
      });
  }
}
