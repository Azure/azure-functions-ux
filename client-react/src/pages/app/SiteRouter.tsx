import { RouteComponentProps, Router } from '@reach/router';
import React, { createContext, lazy, useContext, useEffect, useState } from 'react';
import SiteService from '../../ApiHelpers/SiteService';
import { ArmObj } from '../../models/arm-obj';
import { FunctionAppEditMode, KeyValue, SiteReadWriteState } from '../../models/portal-models';
import { SiteConfig } from '../../models/site/config';
import { Site } from '../../models/site/site';
import { PortalContext } from '../../PortalContext';
import { SiteStateContext } from '../../SiteState';
import { StartupInfoContext } from '../../StartupInfoContext';
import { iconStyles } from '../../theme/iconStyles';
import { ThemeContext } from '../../ThemeContext';
import { isContainerApp, isElastic, isFunctionApp, isLinuxApp, isLinuxDynamic } from '../../utils/arm-utils';
import { CommonConstants } from '../../utils/CommonConstants';
import FunctionAppService from '../../utils/FunctionAppService';
import { LogCategories } from '../../utils/LogCategories';
import LogService from '../../utils/LogService';
import RbacConstants from '../../utils/rbac-constants';
import { ArmSiteDescriptor } from '../../utils/resourceDescriptors';
import SiteHelper from '../../utils/SiteHelper';
import { SiteRouterData } from './SiteRouter.data';
import { getErrorMessageOrStringify } from '../../ApiHelpers/ArmHelper';

export interface SiteRouterProps {
  subscriptionId?: string;
  resourcegroup?: string;
  siteName?: string;
  slotName?: string;
  functionName?: string;
}

export const siteRouterData = new SiteRouterData();
export const SiteRouterContext = createContext(siteRouterData);

// NOTE(michinoy): For consistency sake, please keep all the webpackChunkName values lowercase and without hypens.

const AppSettingsLoadable: any = lazy(() => import(/* webpackChunkName:"appsettings" */ './app-settings/AppSettings'));
const LogStreamLoadable: any = lazy(() => import(/* webpackChunkName:"logstream" */ './log-stream/LogStreamRouter'));
const ChangeAppPlanLoadable: any = lazy(() => import(/* webpackChunkName:"changeappplan" */ './change-app-plan/ChangeAppPlanDataLoader'));
const FunctionIntegrateLoadable: any = lazy(() =>
  import(/* webpackChunkName:"functionintegrate" */ './functions/function/integrate/FunctionIntegrateDataLoader')
);
const FunctionBindingLoadable: any = lazy(() =>
  import(/* webpackChunkName:"functionbinding" */ './functions/function/integrate/BindingPanel/BindingPanel')
);
const FunctionCreateLoadable: any = lazy(() =>
  import(/* webpackChunkName:"functioncreate" */ './functions/create/FunctionCreateDataLoader')
);
const FunctionAppKeysLoadable: any = lazy(() => import(/* webpackChunkName:"functionappkeys" */ './functions/app-keys/AppKeysDataLoader'));
const FunctionKeysLoadable: any = lazy(() =>
  import(/* webpackChunkName: "functionkeys" */ './functions/function/function-keys/FunctionKeysDataLoader')
);
const FunctionEditorLoadable: any = lazy(() =>
  import(/* webpackChunkName:"functioneditor" */ './functions/function/function-editor/FunctionEditorDataLoader')
);
const FunctionQuickstart: any = lazy(() =>
  import(/* webpackChunkName:"functioneditor" */ './functions/quickstart/FunctionQuickstartDataLoader')
);
const AppFilesLoadable: any = lazy(() => import(/* webpackChunkName:"appfiles" */ './functions/app-files/AppFilesDataLoader'));
const FunctionMonitor: any = lazy(() =>
  import(/* webpackChunkName:"functionmonitor" */ './functions/function/monitor/FunctionMonitorDataLoader')
);

const DeploymentCenter: any = lazy(() =>
  import(/* webpackChunkName:"deploymentcenter" */ './deployment-center/DeploymentCenterDataLoader')
);

const SiteRouter: React.FC<RouteComponentProps<SiteRouterProps>> = props => {
  const theme = useContext(ThemeContext);
  const portalContext = useContext(PortalContext);
  const [resourceId, setResourceId] = useState<string | undefined>(undefined);
  const [site, setSite] = useState<ArmObj<Site> | undefined>(undefined);
  const [stopped, setStopped] = useState(false);
  const [siteAppEditState, setSiteAppEditState] = useState<FunctionAppEditMode>(FunctionAppEditMode.ReadWrite);

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

  const getSiteStateFromAppSettings = (appSettings: ArmObj<KeyValue<string>>): FunctionAppEditMode | undefined => {
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
    if (editModeString.toLowerCase() === SiteReadWriteState.readonly) {
      return FunctionAppEditMode.ReadOnly;
    }

    if (editModeString.toLowerCase() === SiteReadWriteState.readwrite) {
      return FunctionAppEditMode.ReadWrite;
    }

    return undefined;
  };

  const resolveAndGetUndefinedSiteState = async (armSiteDescriptor: ArmSiteDescriptor, config?: ArmObj<SiteConfig>) => {
    if (!!config && SiteHelper.isSourceControlEnabled(config)) {
      return FunctionAppEditMode.ReadOnlySourceControlled;
    }

    if (armSiteDescriptor.slot) {
      return FunctionAppEditMode.ReadOnlySlots;
    }

    const slotResponse = await SiteService.fetchSlots(armSiteDescriptor.getSiteOnlyResourceId());
    if (slotResponse.metadata.success) {
      if (slotResponse.data.value.length > 0) {
        return FunctionAppEditMode.ReadOnlySlots;
      }
    } else {
      LogService.error(
        LogCategories.siteRouter,
        'getSlots',
        `Failed to get slots: ${getErrorMessageOrStringify(slotResponse.metadata.error)}`
      );
    }

    return FunctionAppEditMode.ReadWrite;
  };

  const findAndSetSiteState = async () => {
    if (!!resourceId) {
      const armSiteDescriptor = new ArmSiteDescriptor(resourceId);
      const trimmedResourceId = armSiteDescriptor.getTrimmedResourceId();
      const readOnlyLock = await portalContext.hasLock(trimmedResourceId, 'ReadOnly');
      let functionAppEditMode: FunctionAppEditMode | undefined;

      const siteResponse = await SiteService.fetchSite(trimmedResourceId);

      if (readOnlyLock) {
        functionAppEditMode = FunctionAppEditMode.ReadOnlyLock;
      } else {
        const writePermission = await portalContext.hasPermission(trimmedResourceId, [RbacConstants.writeScope]);

        if (!writePermission) {
          functionAppEditMode = FunctionAppEditMode.ReadOnlyRbac;
        } else if (siteResponse.metadata.success && isFunctionApp(siteResponse.data)) {
          functionAppEditMode = getSiteStateFromSiteData(siteResponse.data);

          if (!functionAppEditMode) {
            const appSettingsResponse = await SiteService.fetchApplicationSettings(trimmedResourceId);

            if (appSettingsResponse.metadata.success) {
              functionAppEditMode = getSiteStateFromAppSettings(appSettingsResponse.data);
            } else {
              LogService.error(
                LogCategories.siteRouter,
                'fetchAppSetting',
                `Failed to fetch app settings: ${getErrorMessageOrStringify(appSettingsResponse.metadata.error)}`
              );
            }
          }
        } else if (!siteResponse.metadata.success) {
          LogService.error(
            LogCategories.siteRouter,
            'get site',
            `Failed to get site: ${getErrorMessageOrStringify(siteResponse.metadata.error)}`
          );
        }

        if (!functionAppEditMode) {
          const configResponse = await SiteService.fetchWebConfig(trimmedResourceId);
          functionAppEditMode = await resolveAndGetUndefinedSiteState(
            armSiteDescriptor,
            configResponse.metadata.success ? configResponse.data : undefined
          );

          if (!configResponse.metadata.success) {
            LogService.error(
              LogCategories.siteRouter,
              'fetchWebConfig',
              `Failed to fetch web config: ${getErrorMessageOrStringify(configResponse.metadata.error)}`
            );
          }
        }
      }

      if (siteResponse.metadata.success) {
        setSite(siteResponse.data);
        setStopped(siteResponse.data.properties.state.toLocaleLowerCase() === CommonConstants.SiteStates.stopped);
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
                <SiteStateContext.Provider value={{ site, siteAppEditState, stopped, resourceId }}>
                  <Router>
                    {/* NOTE(michinoy): The paths should be always all lowercase. */}

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
                    <FunctionMonitor resourceId={value.resourceId} path="/monitor" />
                    <DeploymentCenter resourceId={value.resourceId} path="/deploymentcenter" />
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
