import {Injectable, Pipe, PipeTransform} from '@angular/core';
import {FunctionInfo} from '../../shared/models/function-info';

@Pipe({
    name: 'sidebarFilter',
    pure: false
})
@Injectable()
export class SidebarPipe implements PipeTransform {
    transform(items: FunctionInfo[], args: string[] | string): any {
        if (args && args.length > 0) {
            var query = typeof args === 'string' ? args : args[0];
            if (query) {
                return items.filter(item => !item.clientOnly && item.name.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) !== -1);
            }
        }
        return items;
    }
}