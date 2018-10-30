import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'aggregateBlockPipe',
})
export class AggregateBlockPipe implements PipeTransform {
  transform(input: string): string {
    if (!input) {
      return '';
    }
    return input.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}
