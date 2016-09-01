import {Pipe, PipeTransform} from '@angular/core';
import {DatePipe, DecimalPipe} from '@angular/common';

declare let moment: any;

@Pipe({
    name: 'format'
})
export class Format implements PipeTransform {

    datePipe: DatePipe = new DatePipe();
    decimalPipe: DecimalPipe = new DecimalPipe();

    transform(input: string, args: any): any {
        var format = '';
        var parsedFloat = 0;
        var pipeArgs = args.split(':'); // used if multiple case items maps to a single format
        for (var i = 0; i < pipeArgs.length; i++) {
            pipeArgs[i] = pipeArgs[i].trim(' ');
        }

        switch (pipeArgs[0].toLowerCase()) {
            case 'text':
                return input;
            case 'icon':
                return input.toLowerCase() === "completedsuccess" ? `<i class="fa fa-check success" style="color: green"></i>` : `<i class="fa fa-times" style="color: red"></i>`;
            case 'number':
                parsedFloat = !isNaN(parseFloat(input)) ? parseFloat(input) : 0;
                format = pipeArgs.length > 1 ? pipeArgs[1] : null;
                return "(" + this.decimalPipe.transform(Math.round(parsedFloat), format) + " ms running time)";
            case 'datetime':
                return moment.utc(input).from(moment.utc()); // converts the datetime to a diff from current datetime
            default:
                return input;
        }
    }
}