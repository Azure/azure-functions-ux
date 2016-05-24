import {Injectable, Pipe, PipeTransform} from '@angular/core';
import {FunctionInfo} from '../models/function-info';

@Pipe({
    name: 'sidebarFilter',
    pure: false
})
@Injectable()
export class SideBarFilterPipe implements PipeTransform {
    transform(items: FunctionInfo[], args: string[]): any {
        if (args && args.length > 0 && args[0] && args[0].length > 0) {
            return items.filter(item => !item.clientOnly && item.name.toLocaleLowerCase().indexOf(args[0].toLocaleLowerCase()) !== -1);
        } else {
            return items;
        }
    }
}