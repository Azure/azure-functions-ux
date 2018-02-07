import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[table-cell-template]',
})
export class TableCellTemplateDirective {
  @Input() className: string; 
  @Input() showDirtyState: boolean = false;
  @Input() editable: boolean = false;

  constructor(public templateRef: TemplateRef<any>) {
  }
}