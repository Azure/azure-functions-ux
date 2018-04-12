import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[dynamic-loader]',
})
export class DynamicLoaderDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}