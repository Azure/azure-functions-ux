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
  @Input() isRecommendedList: boolean;  // Specs that show up in top row
  @Output() onSelectedSpec = new Subject<PriceSpec>();

  specs: PriceSpec[];

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['specGroup']) {
      if (this.isRecommendedList) {
        this.specs = this.specGroup.specs.slice(0, 4);
      } else if (this.specGroup.specs.length > 4) {
        this.specs = this.specGroup.specs.slice(4, this.specGroup.specs.length);
      }
    }
  }

  selectSpec(spec: PriceSpec) {
    this.onSelectedSpec.next(spec);
  }
}
