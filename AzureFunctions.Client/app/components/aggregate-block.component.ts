import {Component, Input,Pipe} from '@angular/core';
import {aggregateBlockPipe} from '../pipes/aggregate-block.pipe'

@Component({
    selector: 'aggregate-block',
    templateUrl: 'templates/aggregate-block.component.html',
    pipes: [aggregateBlockPipe]
})

export class AggregateBlock  {
    @Input() value: string;
    @Input() title: string;
}