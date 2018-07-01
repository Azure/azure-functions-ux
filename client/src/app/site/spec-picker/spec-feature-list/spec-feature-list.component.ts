import { Component, Input } from '@angular/core';
import { PriceSpecDetail } from '../price-spec-manager/price-spec-detail';

@Component({
  selector: 'spec-feature-list',
  templateUrl: './spec-feature-list.component.html',
  styleUrls: ['./spec-feature-list.component.scss']
})
export class SpecFeatureListComponent {

  @Input() title: string;
  @Input() description: string;
  @Input() featureItems: PriceSpecDetail[];

  constructor() { }

}
