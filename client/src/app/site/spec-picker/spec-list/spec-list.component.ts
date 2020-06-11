import { SimpleChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { Subject } from 'rxjs/Rx';
import { PriceSpecGroup } from './../price-spec-manager/price-spec-group';
import { Component, Input, Output, OnChanges } from '@angular/core';
import { PriceSpec } from '../price-spec-manager/price-spec';

@Component({
  selector: 'spec-list',
  templateUrl: './spec-list.component.html',
  styleUrls: ['./spec-list.component.scss'],
})
export class SpecListComponent implements OnChanges {
  @Input()
  specGroup: PriceSpecGroup;
  @Input()
  isRecommendedList = false;
  @Output()
  onSelectedSpec = new Subject<PriceSpec>();

  specs: PriceSpec[];

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.specGroup) {
      this.specs = this.isRecommendedList ? this.specGroup.recommendedSpecs : this.specGroup.additionalSpecs;
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

  getAriaLabelledByForSpec(spec: PriceSpec) {
    const specDivId = `${this.specGroup.id}${spec.skuCode}`;
    return !!this.isRecommendedList ? `recommendedTierHeaderId ${specDivId}` : `additionalTierHeaderId ${specDivId}`;
  }
}
