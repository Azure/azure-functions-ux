import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-info-control',
  templateUrl: './card-info-control.component.html',
  styleUrls: ['./card-info-control.component.scss']
})
export class CardInfoControlComponent{
  @Input() public image = '';
  @Input() public header = '';
  @Input() public description = '';
  @Input() public learnMoreLink = '';

  @Input() public backgroundImageColor = undefined;
  constructor() { }


}
