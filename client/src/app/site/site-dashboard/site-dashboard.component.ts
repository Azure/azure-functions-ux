import { Url } from './../../shared/Utilities/url';
import { SpecPickerComponent } from './../spec-picker/spec-picker.component';
import { SiteService } from 'app/shared/services/site.service';
import { Subscription } from 'rxjs/Subscription';
import { DashboardType } from 'app/tree-view/models/dashboard-type';
import { LogicAppsComponent } from './../../logic-apps/logic-apps.component';
import { Dom } from './../../shared/Utilities/dom';
import { LogService } from './../../shared/services/log.service';
import { ScenarioService } from './../../shared/services/scenario/scenario.service';
import { SiteConfigComponent } from './../site-config/site-config.component';
import { DirtyStateEvent } from './../../shared/models/broadcast-event';
import { SiteConfigStandaloneComponent } from './../site-config-standalone/site-config-standalone.component';
import { SwaggerDefinitionComponent } from './../swagger-definition/swagger-definition.component';
import { FunctionRuntimeComponent } from './../function-runtime/function-runtime.component';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { SiteManageComponent } from './../site-manage/site-manage.component';
import { TabInfo } from './site-tab/tab-info';
import { SiteSummaryComponent } from './../site-summary/site-summary.component';
import { SiteData } from './../../tree-view/models/tree-view-info';
import { Component, OnDestroy, ElementRef, ViewChild, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';
import { PortalService } from './../../shared/services/portal.service';
import { PortalResources } from './../../shared/models/portal-resources';
import { AiService } from './../../shared/services/ai.service';
import { SiteTabIds, ScenarioIds, LogCategories, KeyCodes } from './../../shared/models/constants';
import { AppNode } from './../../tree-view/app-node';
import { GlobalStateService } from '../../shared/services/global-state.service';
import { TreeViewInfo } from '../../tree-view/models/tree-view-info';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { Site } from '../../shared/models/arm/site';
import { PartSize } from '../../shared/models/portal';
import { NavigableComponent, ExtendedTreeViewInfo } from '../../shared/components/navigable-component';
import { DeploymentCenterComponent } from 'app/site/deployment-center/deployment-center.component';
import { Observable } from 'rxjs/Observable';
import { ConsoleComponent } from '../console/console.component';
import { AppLogStreamComponent } from '../log-stream/log-stream.component';
import { QuickstartComponent } from '../quickstart/quickstart.component';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'site-dashboard',
  templateUrl: './site-dashboard.component.html',
  styleUrls: ['./site-dashboard.component.scss'],
})
export class SiteDashboardComponent extends NavigableComponent implements OnDestroy {
  // We keep a static copy of all the tabs that are open becuase we want to reopen them
  // if a user changes apps or navigates away and comes back.  But we also create an instance
  // copy because the template can't reference static properties
  private static _tabInfos: TabInfo[] = [];
  public tabInfos: TabInfo[] = SiteDashboardComponent._tabInfos;

  @ViewChild('siteTabs')
  groupElements: ElementRef;

  public dynamicTabIds: (string | null)[] = [null, null];
  public site: ArmObj<Site>;
  public viewInfoStream: Subject<TreeViewInfo<SiteData>>;
  public Resources = PortalResources;

  private _currentTabId: string;
  private _prevTabId: string;
  private _currentTabIndex: number;

  private _openTabSubscription: Subscription;
  private _closeTabSubscription: Subscription;
  private _openTroubleshoot: boolean;

  constructor(
    private _globalStateService: GlobalStateService,
    private _aiService: AiService,
    private _portalService: PortalService,
    private _translateService: TranslateService,
    private _scenarioService: ScenarioService,
    private _logService: LogService,
    private _siteService: SiteService,
    public router: Router,
    public route: ActivatedRoute,
    injector: Injector
  ) {
    super('site-dashboard', injector, DashboardType.AppDashboard);

    this._broadcastService
      .getEvents<DirtyStateEvent>(BroadcastEvent.DirtyStateChange)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(event => {
        if (!event.dirty && !event.reason) {
          this.tabInfos.forEach(t => (t.dirty = false));
        } else {
          const info = this.tabInfos.find(t => t.id === event.reason);
          if (info) {
            info.dirty = event.dirty;
          }
        }
      });

    if (this.tabInfos.length === 0) {
      // Setup initial tabs without inputs immediate so that they load right away
      this.tabInfos = [this._getTabInfo(SiteTabIds.overview, true /* active */, null)];

      if (this._scenarioService.checkScenario(ScenarioIds.addSiteConfigTab).status === 'enabled') {
        this.tabInfos.push(this._getTabInfo(SiteTabIds.standaloneConfig, false /* active */, null));
      }

      if (this._scenarioService.checkScenario(ScenarioIds.addSiteFeaturesTab).status === 'enabled') {
        this.tabInfos.push(this._getTabInfo(SiteTabIds.platformFeatures, false /* active */, null));
      }
    }

    const activeTab = this.tabInfos.find(info => info.active);
    if (activeTab) {
      this._currentTabId = activeTab.id;
      this._currentTabIndex = this.tabInfos.findIndex(info => info.active);
    }
  }

  setup(navigationEvents: Observable<ExtendedTreeViewInfo>): Observable<any> {
    return super
      .setup(navigationEvents)
      .switchMap(viewInfo => {
        // ellhamai - This is a not-so-great workaround for the fact that we can't have deep links for
        // child blades of Function apps due to the fact that we've overridden the normal portal
        // asset registration.  The way this works is if we see this query string in the URL,
        // then we'll open a child blade for troubleshoot.  The crappy part about this is that we don't have access to
        // remove the query string from the page's URL so to get around this we remove it from our
        // internal routing for the iframe (see end of setup function for this logic).  This works
        // fine so long as the user never closes the functions blade, but if they refresh or reopen
        // the blade, then we'll automatically open the troubleshoot blade again for the first app they load.
        this._openTroubleshoot = Url.getParameterByName(null, 'appsvc.troubleshoot') === 'true';
        if (this._openTroubleshoot) {
          this._portalService.openFrameBlade(
            {
              detailBlade: 'SCIFrameBlade',
              detailBladeInputs: {
                id: viewInfo.resourceId,
              },
            },
            'site-dashboard'
          );
        }

        if (this._globalStateService.showTryView) {
          this._globalStateService.setDisabledMessage(this._translateService.instant(PortalResources.try_appDisabled));
        }

        viewInfo.data.siteTabRevealedTraceKey = this._aiService.startTrace();
        viewInfo.data.siteTabFullReadyTraceKey = this._aiService.startTrace();

        if (!this._openTabSubscription) {
          this._openTabSubscription = this._broadcastService
            .getEvents<string>(BroadcastEvent.OpenTab)
            .takeUntil(this.ngUnsubscribe)
            .subscribe(tabId => {
              if (tabId) {
                this.openFeature(tabId);
                this._broadcastService.broadcastEvent<string>(BroadcastEvent.OpenTab, null);
              }
            });
        }

        if (!this._closeTabSubscription) {
          this._closeTabSubscription = this._broadcastService
            .getEvents<string>(BroadcastEvent.CloseTab)
            .takeUntil(this.ngUnsubscribe)
            .subscribe(tabId => {
              if (tabId) {
                this.closeFeature(tabId);
                this._broadcastService.broadcastEvent<string>(BroadcastEvent.CloseTab, null);
              }
            });
        }
        return this._siteService.getSite(viewInfo.resourceId);
      })
      .do(r => {
        if (!r.isSuccessful) {
          let message = this._translateService.instant(PortalResources.siteDashboard_getAppError).format(this.viewInfo.siteDescriptor.site);
          if (r.error.result && r.error.result.status === 404) {
            message = this._translateService.instant(PortalResources.siteDashboard_appNotFound).format(this.viewInfo.siteDescriptor.site);
          }

          this._logService.error(LogCategories.siteDashboard, '/site-dashboard', r.error.result);
          this._globalStateService.setDisabledMessage(message);
          return;
        }

        this.site = r.result;

        this._broadcastService.clearAllDirtyStates();

        this._logService.verbose(LogCategories.siteDashboard, `Received new input, updating tabs`);

        for (let i = 0; i < this.tabInfos.length; i++) {
          const info = this.tabInfos[i];

          if (info.active) {
            this._logService.debug(LogCategories.siteDashboard, `Updating inputs for active tab '${info.id}'`);

            // We're not recreating the active tab so that it doesn't flash in the UI
            // All Tabs have `viewInfoInput`
            // Tabs that inherit from FunctionAppContextComponent like FunctionRuntimeComponent have viewInfoComponent_viewInfo
            const tabInfo = this._getTabInfo(info.id, false /* active */, {
              viewInfoInput: this.viewInfo,
            });

            this.tabInfos[i].componentInput = tabInfo.componentInput;
          } else {
            // Just to be extra safe, we create new component instances for tabs that
            // aren't visible to be sure that we can't accidentally load them with the wrong
            // input in the future.  This also helps to dispose of other unused components
            // when we switch apps.
            this.tabInfos[i] = this._getTabInfo(info.id, false /* active */, {
              viewInfoInput: this.viewInfo,
            });
            this._logService.debug(LogCategories.siteDashboard, `Creating new component for inactive tab '${info.id}'`);
          }
        }

        const appNode = <AppNode>this.viewInfo.node;
        if (appNode.openTabId) {
          this.openFeature(appNode.openTabId);
          appNode.openTabId = null;
        }

        if (this._openTroubleshoot) {
          const queryObj = Url.getQueryStringObj();
          delete queryObj['appsvc.troubleshoot'];

          const id = `/resources${this.viewInfo.resourceId}`.toLowerCase().replace('/providers/microsoft.web', '');
          this.router.navigate([id], { relativeTo: this.route, queryParams: queryObj });
        }
      });
  }

  ngOnDestroy() {
    super.ngOnDestroy();

    // Save current set of tabs
    SiteDashboardComponent._tabInfos = this.tabInfos;
  }

  private _selectTabId(id: string) {
    this.selectTab(this.tabInfos.find(i => i.id === id));
  }

  selectTab(info: TabInfo) {
    this._logService.verbose(LogCategories.siteDashboard, `Select Tab - ${info.id}`);

    this._aiService.trackEvent('/sites/open-tab', { name: info.id });
    this.tabInfos.forEach(t => (t.active = t.id === info.id));

    this.viewInfo.data.siteTabRevealedTraceKey = this._aiService.startTrace();
    this.viewInfo.data.siteTabFullReadyTraceKey = this._aiService.startTrace();

    this._prevTabId = this._currentTabId;
    this._currentTabId = info.id;
    this._currentTabIndex = this.tabInfos.findIndex(i => i.id === info.id);
  }

  closeTab(info: TabInfo) {
    this._logService.verbose(LogCategories.siteDashboard, `Close Tab - ${info.id}`);

    const tabIndexToClose = this.tabInfos.findIndex(i => i.id === info.id);
    if (tabIndexToClose >= 0) {
      this.tabInfos.splice(tabIndexToClose, 1);

      // Only need to worry about opening a new tab if the tab being closed is the current one.
      if (info.id === this._currentTabId) {
        if (this._prevTabId) {
          this._selectTabId(this._prevTabId);
        } else {
          this._selectTabId(SiteTabIds.overview);
        }

        // Even though you are not opening a new tab, you still must update the _currentTabIndex value
        // to deal with a possible shift in position of the current tab
      } else {
        this._currentTabIndex = this.tabInfos.findIndex(i => i.id === this._currentTabId);
      }

      // If you close the previous tab, then this will make sure that you don't go back to it
      // if you close the current tab.
      if (info.id === this._prevTabId) {
        this._prevTabId = null;
      }
    }
  }

  openFeature(featureId: string) {
    this._prevTabId = this._currentTabId;
    let tabInfo = this.tabInfos.find(t => t.id === featureId);

    if (!tabInfo) {
      tabInfo = this._getTabInfo(featureId, true /* active */, { viewInfoInput: this.viewInfo });
      this.tabInfos.push(tabInfo);
    }

    this.selectTab(tabInfo);
  }

  closeFeature(featureId: string) {
    let tabInfo = this.tabInfos.find(t => t.id === featureId);

    if (!tabInfo) {
      tabInfo = this._getTabInfo(featureId, true /* active */, { viewInfoInput: this.viewInfo });
      this.tabInfos.push(tabInfo);
    }

    this.closeTab(tabInfo);
  }

  pinPart() {
    this._portalService.pinPart({
      partSize: PartSize.Normal,
      partInput: {
        id: this.viewInfo.resourceId,
      },
    });
  }

  keypress(event: KeyboardEvent) {
    if (event.keyCode === KeyCodes.enter) {
      this.pinPart();
    }
  }

  private _getTabInfo(tabId: string, active: boolean, input: { viewInfoInput: TreeViewInfo<SiteData> }): TabInfo {
    const info = {
      title: '',
      id: tabId,
      active: active,
      closeable: true,
      iconUrl: null,
      dirty: false,
      componentFactory: null,
      componentInput: input
        ? Object.assign({}, input, { viewInfo: input.viewInfoInput, viewInfoComponent_viewInfo: input.viewInfoInput })
        : {},
    };

    switch (tabId) {
      case SiteTabIds.overview:
        info.title = this._translateService.instant(PortalResources.tab_overview);
        info.componentFactory = SiteSummaryComponent;
        info.closeable = false;
        break;

      case SiteTabIds.platformFeatures:
        info.title = this._translateService.instant(PortalResources.tab_features);
        info.componentFactory = SiteManageComponent;
        info.closeable = false;
        break;

      case SiteTabIds.functionRuntime:
        info.title = this._translateService.instant(PortalResources.tab_functionSettings);
        info.iconUrl = 'image/functions.svg';
        info.componentFactory = FunctionRuntimeComponent;
        break;

      case SiteTabIds.apiDefinition:
        info.title = this._translateService.instant(PortalResources.tab_api_definition);
        info.iconUrl = 'image/api-definition.svg';
        info.componentFactory = SwaggerDefinitionComponent;
        break;

      case SiteTabIds.standaloneConfig:
        info.title = this._translateService.instant(PortalResources.tab_configuration);
        info.componentFactory = SiteConfigStandaloneComponent;
        info.closeable = false;
        break;

      case SiteTabIds.applicationSettings:
        info.title = this._translateService.instant(PortalResources.tab_applicationSettings);
        info.iconUrl = 'image/application-settings.svg';
        info.componentFactory = SiteConfigComponent;
        info.closeable = true;
        break;

      case SiteTabIds.logicApps:
        info.title = this._translateService.instant(PortalResources.tab_logicApps);
        info.iconUrl = 'image/logicapp.svg';
        info.componentFactory = LogicAppsComponent;
        info.closeable = true;
        break;

      case SiteTabIds.console:
        info.title = this._translateService.instant(PortalResources.feature_consoleName);
        info.iconUrl = 'image/console.svg';
        info.componentFactory = ConsoleComponent;
        info.closeable = true;
        break;

      case SiteTabIds.logStream:
        info.title = this._translateService.instant(PortalResources.feature_logStreamingName);
        info.iconUrl = 'image/log-stream.svg';
        info.componentFactory = AppLogStreamComponent;
        info.closeable = true;
        break;

      case SiteTabIds.continuousDeployment:
        info.title = this._translateService.instant(PortalResources.deploymentCenter);
        info.iconUrl = 'image/deployment-source.svg';
        info.componentFactory = DeploymentCenterComponent;
        break;

      case SiteTabIds.scaleUp:
        info.title = this._translateService.instant('Scale up');
        info.iconUrl = 'image/scale-up.svg';
        info.componentFactory = SpecPickerComponent;
        (<any>info.componentInput) = {
          viewInfoInput: {
            resourceId: this.site.properties.serverFarmId,
          },
        };
        break;

      case SiteTabIds.quickstart:
        info.title = this._translateService.instant(PortalResources.quickstart);
        info.iconUrl = 'image/quickstart.svg';
        info.componentFactory = QuickstartComponent;
        break;
    }

    return info;
  }

  _getTabElements() {
    return this.groupElements.nativeElement.children;
  }

  _clearFocusOnTab(elements: HTMLCollection, index: number) {
    const oldFeature = Dom.getTabbableControl(<HTMLElement>elements[index]);
    Dom.clearFocus(oldFeature);
  }

  _setFocusOnTab(elements: HTMLCollection, index: number) {
    let finalIndex = -1;
    let destFeature: Element;

    // Wrap around logic for navigating through a tab list
    if (elements.length > 0) {
      if (index > 0 && index < elements.length) {
        finalIndex = index;
      } else if (index === -1) {
        finalIndex = elements.length - 1;
      } else {
        finalIndex = 0;
      }
      destFeature = elements[finalIndex];
    }

    this._currentTabIndex = finalIndex;

    if (destFeature) {
      const newFeature = Dom.getTabbableControl(<HTMLElement>destFeature);
      Dom.setFocus(<HTMLElement>newFeature);
    }
  }

  onKeyPress(event: KeyboardEvent, info: TabInfo) {
    if (event.keyCode === KeyCodes.enter || event.keyCode === KeyCodes.space) {
      this.selectTab(info);
      event.preventDefault();
    } else if (event.keyCode === KeyCodes.arrowRight) {
      const tabElements = this._getTabElements();
      this._clearFocusOnTab(tabElements, this._currentTabIndex);
      this._setFocusOnTab(tabElements, this._currentTabIndex + 1);
      event.preventDefault();
    } else if (event.keyCode === KeyCodes.arrowLeft) {
      const tabElements = this._getTabElements();
      this._clearFocusOnTab(tabElements, this._currentTabIndex);
      this._setFocusOnTab(tabElements, this._currentTabIndex - 1);
      event.preventDefault();
    } else if (event.keyCode === KeyCodes.delete) {
      if (info.closeable) {
        this.closeTab(info);
        // Allow page to re-render tabs before setting focus on new one
        setTimeout(() => {
          const tabElements = this._getTabElements();
          this._setFocusOnTab(tabElements, this._currentTabIndex);
        }, 0);
      }
    }
  }
}
