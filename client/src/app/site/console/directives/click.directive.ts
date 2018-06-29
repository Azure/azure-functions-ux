import {Directive, ElementRef, Output, HostListener, EventEmitter} from '@angular/core';

@Directive({
  selector: '[clickOutside]'
})
export class ClickOutsideDirective{
  constructor(private _elementRef: ElementRef){
  }
  
  @Output()
  public clickOutside = new EventEmitter();

  @HostListener('document: click', ['$event.target'])
  public onClick(targetElement){
    const inside = this._elementRef.nativeElement.contains(targetElement);
    if(!inside){
      this.clickOutside.emit(null);
    }
  }
}