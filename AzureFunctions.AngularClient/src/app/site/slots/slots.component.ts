import { Component, Input } from '@angular/core';
import { TreeViewInfo, SiteData } from './../../tree-view/models/tree-view-info';

@Component({
    selector: 'slots',
    templateUrl: './slots.component.html',
    styleUrls: ['./slots.component.scss']
})
export class SlotsComponent {
    @Input() viewInfoInput: TreeViewInfo<SiteData>;
}