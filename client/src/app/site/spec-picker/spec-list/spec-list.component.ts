import { SimpleChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { Subject } from 'rxjs/Rx';
import { PriceSpecGroup } from './../price-spec-manager/price-spec-group';
import { Component, Input, Output, OnChanges } from '@angular/core';
import { PriceSpec } from '../price-spec-manager/price-spec';

@Component({
  selector: 'spec-list',
  templateUrl: './spec-list.component.html',
  styleUrls: ['./spec-list.component.scss']
})
export class SpecListComponent implements OnChanges {
  @Input() specGroup: PriceSpecGroup;
  @Input() isExpanded = false;
  @Output() onSelectedSpec = new Subject<PriceSpec>();

  specs: PriceSpec[];

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (this.specGroup) {
      this.specs = this.isExpanded
        ? this.specGroup.specs
        : this.specs = this.specGroup.specs.slice(0, 4);
    }
  }

  selectSpec(spec: PriceSpec) {
    this.onSelectedSpec.next(spec);
  }

  selectSpecByEnterKey(element: HTMLElement) {
    const spec = this.specs.find(s => element.id.endsWith(s.skuCode));
    if (spec) {
      this.selectSpec(spec);
    }
  }
}
