import React, { lazy, useContext, createContext, useEffect, useState } from 'react';
import { RouteComponentProps, Router } from '@reach/router';
import { StartupInfoContext } from '../../StartupInfoContext';
import { iconStyles } from '../../theme/iconStyles';
import { ThemeContext } from '../../ThemeContext';
import { SiteRouterData } from './SiteRouter.data';
import { SiteStateContext } from '../../SiteStateContext';
import { SiteState, FunctionAppEditMode } from '../../models/portal-models';
import { ArmSiteDescriptor } from '../../utils/resourceDescriptors';
import SiteService from '../../ApiHelpers/SiteService';
import { isFunctionApp, isLinuxDynamic, isLinuxApp, isElastic, isContainerApp } from '../../utils/arm-utils';
import FunctionAppService from '../../utils/FunctionAppService';
import { CommonConstants } from '../../utils/CommonConstants';
import { ArmObj } from '../../models/arm-obj';
import { Site } from '../../models/site/site';
import { PortalContext } from '../../PortalContext';
import { SiteConfig } from '../../models/site/config';
import SiteHelper from '../../utils/SiteHelper';
import { LogCategories } from '../../utils/LogCategories';
import LogService from '../../utils/LogService';

export interface SiteRouterProps {
  subscriptionId?: string;
  resourcegroup?: string;
  siteName?: string;
  slotName?: string;
  functionName?: string;
}

export const siteRouterData = new SiteRouterData();
export const SiteRouterContext = createContext(siteRouterData);

const AppSettingsLoadable: any = lazy(() => import(/* webpackChunkName:"appsettings" */ './app-settings/AppSettings'));
const LogStreamLoadable: any = lazy(() => import(/* webpackChunkName:"logstream" */ './log-stream/LogStreamDataLoader'));
const ChangeAppPlanLoadable: any = lazy(() => import(/* webpackChunkName:"changeappplan" */ './change-app-plan/ChangeAppPlanDataLoader'));
const FunctionIntegrateLoadable: any = lazy(() =>
  import(/* webpackChunkName:"functionintegrate" */ './functions/integrate/FunctionIntegrateDataLoader')
);
const FunctionBindingLoadable: any = lazy(() =>
  import(/* webpackChunkName:"functionbinding" */ './functions/integrate/BindingPanel/BindingPanel')
);
const FunctionCreateLoadable: any = lazy(() =>
  import(/* webpackChunkName:"functioncreate" */ './functions/create/FunctionCreateDataLoader')
);
const FunctionAppKeysLoadable: any = lazy(() => import(/* webpackChunkName:"functionappkeys" */ './functions/app-keys/AppKeysDataLoader'));

const FunctionKeysLoadable: any = lazy(() =>
  import(/* webpackChunkName: "functionKeys" */ './functions/function-keys/FunctionKeysDataLoader')
);
const FunctionEditorLoadable: any = lazy(() =>
  import(/* webpackChunkName:"functioneditor" */ './functions/function-editor/FunctionEditorDataLoader')
);
const FunctionQuickstart: any = lazy(() =>
  import(/* webpackChunkName:"functioneditor" */ './functions/quickstart/FunctionQuickstartDataLoader')
);
const AppFilesLoadable: any = lazy(() => import(/* webpackChunkName:"appsettings" */ './app-files/AppFilesDataLoader'));

const SiteRouter: React.FC<RouteComponentProps<SiteRouterProps>> = props => {
  const theme = useContext(ThemeContext);
  const portalContext = useContext(PortalContext);
  const [resourceId, setResourceId] = useState<string | undefined>(undefined);
  const [siteAppEditState, setSiteAppEditState] = useState(FunctionAppEditMode.ReadWrite);
  const [siteStopped, setSiteStopped] = useState(false);

  const getSiteStateFromSiteData = (site: ArmObj<Site>): FunctionAppEditMode | undefined => {
    if (isLinuxDynamic(site)) {
      return FunctionAppEditMode.ReadOnlyLinuxDynamic;
    }
    if (isContainerApp(site)) {
      return FunctionAppEditMode.ReadOnlyBYOC;
    }
    if (isLinuxApp(site) && isElastic(site)) {
      return FunctionAppEditMode.ReadOnlyLinuxCodeElastic;
    }
    return undefined;
  };

  const getSiteStateFromAppSettings = (appSettings: ArmObj<{ [key: string]: string }>): FunctionAppEditMode | undefined => {
    if (FunctionAppService.usingRunFromPackage(appSettings)) {
      return FunctionAppEditMode.ReadOnlyRunFromPackage;
    }
    if (FunctionAppService.usingLocalCache(appSettings)) {
      return FunctionAppEditMode.ReadOnlyLocalCache;
    }
    if (FunctionAppService.usingPythonWorkerRuntime(appSettings)) {
      return FunctionAppEditMode.ReadOnlyPython;
    }
    if (FunctionAppService.usingJavaWorkerRuntime(appSettings)) {
      return FunctionAppEditMode.ReadOnlyJava;
    }
    const editModeString = appSettings.properties[CommonConstants.AppSettingNames.functionAppEditModeSettingName] || '';
    if (editModeString.toLowerCase() === SiteState.readonly) {
      return FunctionAppEditMode.ReadOnly;
    }
    if (editModeString.toLowerCase() === SiteState.readwrite) {
      return FunctionAppEditMode.ReadWrite;
    }

    return undefined;
  };

  const resolveAndGetUndefinedSiteState = (armSiteDescriptor: ArmSiteDescriptor, config?: ArmObj<SiteConfig>) => {
    if (!!config && SiteHelper.isSourceControlEnabled(config)) {
      return FunctionAppEditMode.ReadOnlySourceControlled;
    }
    if (armSiteDescriptor.slot) {
      return FunctionAppEditMode.ReadOnlySlots;
    }
    return FunctionAppEditMode.ReadWrite;
  };

  const findAndSetSiteState = async () => {
    if (!!resourceId) {
      const armSiteDescriptor = new ArmSiteDescriptor(resourceId);
      const trimmedResourceId = armSiteDescriptor.getTrimmedResourceId();
      const readOnlyLock = await portalContext.hasLock(trimmedResourceId, 'ReadOnly');
      let functionAppEditMode: FunctionAppEditMode | undefined;

      const site = await SiteService.fetchSite(trimmedResourceId);

      if (readOnlyLock) {
        functionAppEditMode = FunctionAppEditMode.ReadOnlyLock;
      } else {
        if (site.metadata.success && isFunctionApp(site.data)) {
          functionAppEditMode = getSiteStateFromSiteData(site.data);

          if (!functionAppEditMode) {
            const appSettingsResponse = await SiteService.fetchApplicationSettings(trimmedResourceId);

            if (appSettingsResponse.metadata.success) {
              functionAppEditMode = getSiteStateFromAppSettings(appSettingsResponse.data);
            } else {
              LogService.error(
                LogCategories.siteDashboard,
                'fetchAppSetting',
                `Failed to fetch app settings: ${appSettingsResponse.metadata.error}`
              );
            }
          }
        } else if (!site.metadata.success) {
          LogService.error(LogCategories.siteDashboard, 'get site', `Failed to get site: ${site.metadata.error}`);
        }

        if (!functionAppEditMode) {
          const configResponse = await SiteService.fetchWebConfig(trimmedResourceId);
          functionAppEditMode = resolveAndGetUndefinedSiteState(
            armSiteDescriptor,
            configResponse.metadata.success ? configResponse.data : undefined
          );
          if (!configResponse.metadata.success) {
            LogService.error(LogCategories.siteDashboard, 'fetchWebConfig', `Failed to fetch web config: ${configResponse.metadata.error}`);
          }
        }
      }

      if (site.metadata.success && site.data.properties.state.toLocaleLowerCase() === CommonConstants.SiteStates.stopped) {
        setSiteStopped(true);
      }

      setSiteAppEditState(functionAppEditMode);
    }
  };

  useEffect(() => {
    findAndSetSiteState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceId]);
  return (
    <main className={iconStyles(theme)}>
      <SiteRouterContext.Provider value={siteRouterData}>
        <StartupInfoContext.Consumer>
          {value => {
            setResourceId(value.token && value.resourceId);
            return (
              value.token && (
                <SiteStateContext.Provider value={{ stopped: siteStopped, readOnlyState: siteAppEditState }}>
                  <Router>
                    <AppSettingsLoadable resourceId={value.resourceId} path="/settings" />
                    <LogStreamLoadable resourceId={value.resourceId} path="/log-stream" />
                    <ChangeAppPlanLoadable resourceId={value.resourceId} path="/changeappplan" />
                    <FunctionIntegrateLoadable resourceId={value.resourceId} path="/integrate" />
                    <FunctionBindingLoadable resourceId={value.resourceId} path="/bindingeditor" />
                    <FunctionCreateLoadable resourceId={value.resourceId} path="/functioncreate" />
                    <FunctionAppKeysLoadable resourceId={value.resourceId} path="/appkeys" />
                    <FunctionKeysLoadable resourceId={value.resourceId} path="/functionkeys" />
                    <FunctionEditorLoadable resourceId={value.resourceId} path="/functioneditor" />
                    <FunctionQuickstart resourceId={value.resourceId} path="/functionquickstart" />
                    <AppFilesLoadable resourceId={value.resourceId} path="/appfiles" />
                  </Router>
                </SiteStateContext.Provider>
              )
            );
          }}
        </StartupInfoContext.Consumer>
      </SiteRouterContext.Provider>
    </main>
  );
};
export default SiteRouter;
