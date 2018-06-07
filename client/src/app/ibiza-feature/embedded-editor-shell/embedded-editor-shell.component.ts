import { TreeViewInfo, SiteData } from './../../tree-view/models/tree-view-info';
import { Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { DashboardType } from '../../tree-view/models/dashboard-type';

@Component({
    selector: 'embedded-editor-shell',
    templateUrl: './embedded-editor-shell.component.html',
    styleUrls: ['./embedded-editor-shell.component.scss']
})
export class EmbeddedEditorShellComponent implements OnDestroy {
    viewInfo: TreeViewInfo<SiteData>;

    private routeParamsSubscription: Subscription;
    constructor(translateService: TranslateService, route: ActivatedRoute) {

        this.routeParamsSubscription = route.params.subscribe(x => {
            this.viewInfo = {
                resourceId: `providers/microsoft.blueridge/environments/:environmentId/functions/:functionId`,
                dashboardType: DashboardType.none,
                node: null,
                data: null
            };
        });
    }

    ngOnDestroy(): void {
        this.routeParamsSubscription.unsubscribe();
    }
}
