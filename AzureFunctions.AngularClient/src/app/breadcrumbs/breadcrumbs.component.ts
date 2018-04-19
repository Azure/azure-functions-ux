import { Component } from '@angular/core';

import { TreeViewInfo } from '../tree-view/models/tree-view-info';

@Component({
    selector: 'breadcrumbs',
    templateUrl: './breadcrumbs.component.html',
    styleUrls: ['./breadcrumbs.component.scss'],
    inputs: ['viewInfoInput']
})
export class BreadcrumbsComponent {
    public path: string;

    constructor() { }

    set viewInfoInput(viewInfo: TreeViewInfo<any>) {
        const pathNames = viewInfo.node.getTreePathNames();
        let path = '';

        pathNames.forEach(name => {
            path += name + ' > ';
        });

        this.path = path.substring(0, path.length - 3);
    }
}
