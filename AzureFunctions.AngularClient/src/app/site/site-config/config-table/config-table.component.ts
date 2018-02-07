import { Component } from '@angular/core';
import { AddDeleteTableComponent } from 'app/shared/components/add-delete-table.component';

@Component({
    selector: 'config-table',
    templateUrl: './config-table.component.html',
    styleUrls: ['./../site-config.component.scss']
})
export class ConfigTableComponent extends AddDeleteTableComponent {
}