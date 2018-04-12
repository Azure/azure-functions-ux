import { Component, Input } from '@angular/core';

@Component({
  selector: 'aggregate-block',
  templateUrl: './aggregate-block.component.html',
  styleUrls: ['./aggregate-block.component.css']
})
export class AggregateBlockComponent {
  @Input() value: string;
  @Input() title: string;
}
