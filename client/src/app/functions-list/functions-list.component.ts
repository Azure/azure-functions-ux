import { ExtendedTreeViewInfo } from './../shared/components/navigable-component';
import { ArmSiteDescriptor } from './../shared/resourceDescriptors';
import { FunctionAppContext } from './../shared/function-app-context';
import { TreeUpdateEvent, BroadcastEvent } from './../shared/models/broadcast-event';
import { FunctionInfo } from 'app/shared/models/function-info';
import { CreateCard } from 'app/function/function-new/function-new.component';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { errorIds } from './../shared/models/error-ids';
import { AppNode } from './../tree-view/app-node';
import { Component, OnDestroy, Injector } from '@angular/core';
import { FunctionNode } from './../tree-view/function-node';
import { FunctionsNode } from './../tree-view/functions-node';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../shared/models/portal-resources';
import { PortalService } from '../shared/services/portal.service';
import { Observable } from 'rxjs/Observable';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { NavigableComponent } from '../shared/components/navigable-component';
import { EmbeddedService } from 'app/shared/services/embedded.service';
import { ErrorEvent } from 'app/shared/models/error-event';

@Component({
    selector: 'functions-list',
    templateUrl: './functions-list.component.html',
    styleUrls: ['./functions-list.component.scss']
})
export class FunctionsListComponent extends NavigableComponent implements OnDestroy {
    public functions: FunctionNode[] = [];
    public isLoading: boolean;
    public appNode: AppNode;
    public runtimeVersion: string;
    public context: FunctionAppContext;
    public sidePanelOpened = false;
    public createCards: CreateCard[] = [];          // Used for embedded scenarios
    public createFunctionCard: CreateCard = null;   // Used for embedded scenarios
    public createFunctionLanguage: string = null;   // Used for embedded scenarios
    public isEmbedded: boolean;                     // Used for embedded scenarios

    // TODO: ellhamai - need to set this or have child component set this
    public functionsInfo: FunctionInfo[] = null;

    private _functionsNode: FunctionsNode;

    constructor(
        private _portalService: PortalService,
        private _translateService: TranslateService,
        private _functionAppService: FunctionAppService,
        private _embeddedService: EmbeddedService,
        injector: Injector) {

        super('functions-list', injector, DashboardType.FunctionsDashboard);
        this.isEmbedded = this._portalService.isEmbeddedFunctions;
    }

    setup(navigationEvents: Observable<ExtendedTreeViewInfo>): Observable<any> {
        return super.setup(navigationEvents)
            .switchMap(viewInfo => {
                this.clearBusyEarly();
                this.isLoading = true;
                this._functionsNode = (<FunctionsNode>viewInfo.node);
                this.appNode = (<AppNode>viewInfo.node.parent);
                const descriptor = ArmSiteDescriptor.getSiteDescriptor(viewInfo.resourceId);
                return this._functionAppService.getAppContext(descriptor.getTrimmedResourceId());
            })
            .switchMap(context => {
                this.context = context;
                return Observable.zip(
                    this._functionsNode.loadChildren(),
                    this._functionAppService.getRuntimeGeneration(this.context),
                    this._portalService.isEmbeddedFunctions ? this._buildCreateCardTemplate(context) : Observable.of(null));
            })
            .do(tuple => {
                this.runtimeVersion = tuple[1];
                this.isLoading = false;
                this.functions = (<FunctionNode[]>this._functionsNode.children);
                this.functionsInfo = this._functionsNode.children.map((child: FunctionNode) => {
                    return child.functionInfo;
                });
            });
    }

    private _buildCreateCardTemplate(context: FunctionAppContext) {
        return this._functionAppService.getTemplates(context)
            .do(templates => {

                templates.result.forEach((template) => {

                    const templateIndex = this.createCards.findIndex(finalTemplate => {
                        return finalTemplate.name === template.metadata.name;
                    });

                    // if the card doesn't exist, create it based off the template, else add information to the preexisting card
                    if (templateIndex === -1) {
                        this.createCards.push({
                            name: `${template.metadata.name}`,
                            value: template.id,
                            description: template.metadata.description,
                            enabledInTryMode: template.metadata.enabledInTryMode,
                            AADPermissions: template.metadata.AADPermissions,
                            languages: [`${template.metadata.language}`],
                            categories: template.metadata.category,
                            ids: [`${template.id}`],
                            icon: 'image/other.svg',
                            color: '#000000',
                            barcolor: '#D9D9D9',
                            focusable: false
                        });
                    } else {
                        this.createCards[templateIndex].languages.push(`${template.metadata.language}`);
                        this.createCards[templateIndex].categories = this.createCards[templateIndex].categories.concat(template.metadata.category);
                        this.createCards[templateIndex].ids.push(`${template.id}`);
                    }
                });

                // unique categories
                this.createCards.forEach((template, index) => {
                    const categoriesDict: { [key: string]: string; } = {};
                    template.categories.forEach(category => {
                        categoriesDict[category] = category;
                    });
                    this.createCards[index].categories = [];
                    for (const category in categoriesDict) {
                        if (categoriesDict.hasOwnProperty(category)) {
                            this.createCards[index].categories.push(category);
                        }
                    }
                });

                this.createFunctionCard = this.createCards[0];
            });
    }

    clickRow(item: FunctionNode) {
        item.select();
    }

    enableChange(item: FunctionNode, enabled: boolean) {
        item.functionInfo.config.disabled = !enabled;
        this.setBusy();
        item.functionInfo.config.disabled
            ? this._portalService.logAction('function-list', 'disable')
            : this._portalService.logAction('function-list', 'enable');

        const observable = (this.runtimeVersion === 'V2')
            ? this._functionAppService.updateDisabledAppSettings(this.context, [item.functionInfo])
            : this._functionAppService.updateFunction(this.context, item.functionInfo);

        return observable
            .do(null, e => {
                item.functionInfo.config.disabled = !item.functionInfo.config.disabled;
                const state = item.functionInfo.config.disabled ? this._translateService.instant(PortalResources.enable) : this._translateService.instant(PortalResources.disable);
                this.showComponentError({
                    message: this._translateService.instant(PortalResources.failedToSwitchFunctionState, { state: state, functionName: item.functionInfo.name }),
                    errorId: errorIds.failedToSwitchEnabledFunction,
                    resourceId: this.context.site.id
                });
                this.clearBusy();
                console.error(e);
            })
            .subscribe(() => {
                this.clearComponentErrors();
                this.clearBusy();
            });
    }

    clickDelete(item: FunctionNode) {
        if (this._portalService.isEmbeddedFunctions) {
            this.embeddedDelete(item);
            return;
        }
        const functionInfo = item.functionInfo;
        const result = confirm(this._translateService.instant(PortalResources.functionManage_areYouSure, { name: functionInfo.name }));
        if (result) {
            this.setBusy();
            this._portalService.logAction('function-list', 'delete');
            this._functionAppService.deleteFunction(this.context, functionInfo)
                .do(null, e => {
                    this.clearBusy();
                    console.error(e);
                })
                .subscribe(() => {
                    const indexToDelete = this.functions.indexOf(item);
                    if (indexToDelete > -1) {
                        this.functions.splice(indexToDelete, 1);
                    }

                    const resourceId = `${this._functionsNode.resourceId}/${item.functionInfo.name}`;
                    this._functionsNode.removeChild(resourceId, false);

                    const defaultHostName = this.context.site.properties.defaultHostName;
                    const scmHostName = this.context.scmUrl;

                    item.sideNav.cacheService.clearCachePrefix(`https://${defaultHostName}`);
                    item.sideNav.cacheService.clearCachePrefix(`https://${scmHostName}`);

                    this.clearBusy();
                });
        }
    }

    embeddedDelete(item: FunctionNode) {
        const result = confirm(this._translateService.instant(PortalResources.functionManage_areYouSure, { name: item.functionInfo.name }));
        if (result) {
            this.setBusy();
            this._embeddedService.deleteFunction(item.resourceId)
                .subscribe(r => {
                    if (r.isSuccessful) {
                        this.clearBusy(); this.clearBusy();
                        this._broadcastService.broadcastEvent<TreeUpdateEvent>(BroadcastEvent.TreeUpdate, {
                            resourceId: item.resourceId,
                            operation: 'remove'
                        });
                    } else {
                        this.clearBusy();
                        this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                            message: r.error.message,
                            errorId: r.error.errorId,
                            resourceId: item.resourceId,
                        });
                    }
                });
        }
    }

    searchChanged(value: string) {
        this.functions = (<FunctionNode[]>this._functionsNode.children).filter(c => {
            return c.functionInfo.name.toLowerCase().indexOf(value.toLowerCase()) > -1;
        });
    }

    searchCleared() {
        this.functions = (<FunctionNode[]>this._functionsNode.children);
    }

    onNewFunctionClick() {
        if (this._portalService.isEmbeddedFunctions) {
            this.sidePanelOpened = true;
        } else {
            this._functionsNode.openCreateDashboard(DashboardType.CreateFunctionDashboard);
        }
    }

    closeSidePanel() {
        this.sidePanelOpened = false;
    }
}
