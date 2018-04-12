import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
import { DatePipe, DecimalPipe } from '@angular/common';

declare let moment: any;

@Pipe({
    name: 'format'
})
export class TableFunctionMonitorPipe implements PipeTransform {

    constructor(private sanitized: DomSanitizer) { }

    datePipe: DatePipe = new DatePipe("en-US");
    decimalPipe: DecimalPipe = new DecimalPipe("en-US");

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
                if (input.toLowerCase() === "completedsuccess") {
                    return this.sanitized.bypassSecurityTrustHtml(`<i style="color: green" class="fa fa-check success"></i>`);
                }
                if (input.toLowerCase() === "running") {
                    return this.sanitized.bypassSecurityTrustHtml(`<i class="fa fa-ellipsis-h" style="color: blue" ></i>`);
                }
                if (input.toLowerCase() === "neverfinished") {
                    return this.sanitized.bypassSecurityTrustHtml(`<i style="color: orange" class="fa fa-exclamation-circle"></i>`);
                }
                return this.sanitized.bypassSecurityTrustHtml(`<i class="fa fa-times" style="color: red"></i>`);
            case 'number':
                parsedFloat = !isNaN(parseFloat(input)) ? parseFloat(input) : 0;
                format = pipeArgs.length > 1 ? pipeArgs[1] : null;
                return "(" + this.decimalPipe.transform(Math.round(parsedFloat), format) + " ms)";
            case 'datetime':
                return moment.utc(input).from(moment.utc()); // converts the datetime to a diff from current datetime
            default:
                return input;
        }
    }
}