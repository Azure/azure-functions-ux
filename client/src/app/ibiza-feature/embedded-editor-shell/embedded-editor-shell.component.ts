import { TreeViewInfo, SiteData } from './../../tree-view/models/tree-view-info';
import { Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { DashboardType } from '../../tree-view/models/dashboard-type';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'embedded-editor-shell',
    templateUrl: './embedded-editor-shell.component.html',
    styleUrls: ['./embedded-editor-shell.component.scss']
})
export class EmbeddedEditorShellComponent implements OnDestroy {
    viewInfo: TreeViewInfo<SiteData>;
    ngUnsubscribe: Subject<void>;

    private routeParamsSubscription: Subscription;
    constructor(translateService: TranslateService, route: ActivatedRoute) {
        this.ngUnsubscribe = new Subject<void>();
        route.params
            .takeUntil(this.ngUnsubscribe)
            .subscribe(x => {
                this.viewInfo = {
                    resourceId: `/providers/Microsoft.Functions/environments/${x['environmentId']}/functionapps/${x['functionAppId']}/functions/${x['functionId']}`,
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
