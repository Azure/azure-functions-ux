import {Pipe, PipeTransform, Injectable} from "@angular/core";

@Pipe({
    name: "aggregateBlockPipe"
})
@Injectable()
export class aggregateBlockPipe implements PipeTransform {
    transform(input: string): string {
        if(!input) {
            return "";
        }
        return input.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
}