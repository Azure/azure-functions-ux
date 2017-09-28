import { Component, Type, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from 'app/shared/models/portal-resources';
import { ActivatedRoute } from '@angular/router';
import { SiteConfigComponent } from 'app/site/site-config/site-config.component';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'app-app-settings-shell',
    templateUrl: './app-settings-shell.component.html',
    styleUrls: ['./app-settings-shell.component.scss']
})
export class AppSettingsShellComponent implements OnDestroy {
    title: string;

    id: string;

    active: boolean;

    closeable: boolean;

    componentFactory: Type<any>;

    componentInput: { [key: string]: any };

    iconUrl = '';

    private routeParamsSubscription: Subscription;
    constructor(translateService: TranslateService, route: ActivatedRoute) {
        this.title = translateService.instant(PortalResources.tab_configuration);
        this.componentFactory = SiteConfigComponent;
        this.closeable = false;
        this.active = true;
        this.componentInput = {
            resourceId: null
        };

        this.routeParamsSubscription = route.params.subscribe(x => {
            this.componentInput = {
                viewInfoInput: {
                    resourceId: `/subscriptions/${x['subscriptionId']}/resourceGroups/${x[
                        'resourceGroup'
                    ]}/providers/Microsoft.Web/sites/${x['site']}` + (x['slot'] ? `/slots/${x['slot']}` : ``)
                }
            };
        });
    }

    ngOnDestroy(): void {
        this.routeParamsSubscription.unsubscribe();
    }
}
