import { Pipe, PipeTransform } from '@angular/core';
import { CustomFormGroup } from './../../controls/click-to-edit/click-to-edit.component';

@Pipe({
    name: 'excludeDeleted',
    pure: false
})
export class DeletedItemsFilter implements PipeTransform {
    transform(items: any[], filter: Object): any {
        if (!items || filter !== true) {
            return items;
        }
        // filter items array, items which match and return true will be
        // kept, false will be filtered out
        return items.filter(item => (item as CustomFormGroup)._msExistenceState != 'deleted');
    }
}