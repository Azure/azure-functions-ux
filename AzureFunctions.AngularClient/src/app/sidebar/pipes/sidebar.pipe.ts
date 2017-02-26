import {Injectable, Pipe, PipeTransform} from '@angular/core';
import {FunctionInfo} from '../../shared/models/function-info';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../../shared/models/portal-resources';

@Pipe({
    name: 'sidebarFilter',
    pure: false
})
@Injectable()
export class SidebarPipe implements PipeTransform {
    transform(items: any[], args: string[] | string): any {
        if (args && args.length > 0) {
            var query = typeof args === 'string' ? args : args[0];
            if (query) {
                return items.filter(item => !item.clientOnly && item.name.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) !== -1 && item.name !== PortalResources.sidebar_newApiProxy);
            }
        }
        return items;
    }
}