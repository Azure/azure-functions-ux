import { RouteComponentProps, Router } from '@reach/router';
import React, { createContext, lazy, useContext, useCallback, useState } from 'react';
import SiteService from '../../ApiHelpers/SiteService';
import { ArmObj } from '../../models/arm-obj';
import { FunctionAppEditMode } from '../../models/portal-models';
import { Site } from '../../models/site/site';
import { PortalContext } from '../../PortalContext';
import { SiteStateContext } from '../../SiteState';
import { StartupInfoContext } from '../../StartupInfoContext';
import { iconStyles } from '../../theme/iconStyles';
import { ThemeContext } from '../../ThemeContext';
import { isContainerApp, isFunctionApp, isKubeApp, isLinuxApp } from '../../utils/arm-utils';
import { CommonConstants } from '../../utils/CommonConstants';
import { ArmSiteDescriptor } from '../../utils/resourceDescriptors';
import { SiteRouterData } from './SiteRouter.data';
import LoadingComponent from '../../components/Loading/LoadingComponent';
import { AppSettings } from '../../models/app-setting';
import { resolveState } from '../../utils/app-state-utils';

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
const FunctionNewCreatePreviewLoadable: any = lazy(() =>
  import(/* webpackChunkName:"functioncreate" */ './functions/new-create-preview/FunctionCreateDataLoader')
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

const SiteRouter: React.FC<RouteComponentProps<SiteRouterProps>> = () => {
  const theme = useContext(ThemeContext);
  const portalContext = useContext(PortalContext);
  const [site, setSite] = useState<ArmObj<Site> | undefined>(undefined);
  const [stopped, setStopped] = useState(false);
  const [siteAppEditState, setSiteAppEditState] = useState<FunctionAppEditMode>(FunctionAppEditMode.ReadWrite);
  const [isLinuxApplication, setIsLinuxApplication] = useState<boolean>(false);
  const [isContainerApplication, setIsContainerApplication] = useState<boolean>(false);
  const [isFunctionApplication, setIsFunctionApplication] = useState<boolean>(false);
  const [isKubeApplication, setIsKubeApplication] = useState<boolean>(false);

  const fetchDataAndSetState = useCallback(async (resourceId?: string) => {
    if (resourceId) {
      const armSiteDescriptor = new ArmSiteDescriptor(resourceId);
      const trimmedResourceId = armSiteDescriptor.getTrimmedResourceId();

      const [siteResponse, appSettingsResponse] = await Promise.all([
        SiteService.fetchSite(trimmedResourceId),
        SiteService.fetchApplicationSettings(trimmedResourceId),
      ]);

      let site: ArmObj<Site> | undefined;
      let appSettings: ArmObj<AppSettings> | undefined;

      if (siteResponse.metadata.success) {
        site = siteResponse.data;
      } else {
        portalContext.log({
          action: 'fetchSite',
          actionModifier: 'failed',
          resourceId: resourceId,
          logLevel: 'error',
          data: {
            error: siteResponse.metadata.error,
            message: 'Failed to fetch site data',
          },
        });
      }

      if (appSettingsResponse.metadata.success) {
        appSettings = appSettingsResponse.data;
      } else {
        portalContext.log({
          action: 'fetchAppSetting',
          actionModifier: 'failed',
          resourceId: resourceId,
          logLevel: 'error',
          data: {
            error: appSettingsResponse.metadata.error,
            message: 'Failed to fetch app settings',
          },
        });
      }

      if (site) {
        const editMode = await resolveState(portalContext, trimmedResourceId, site, appSettings, resourceId);
        setSite(site);
        setStopped(site.properties.state.toLocaleLowerCase() === CommonConstants.SiteStates.stopped);
        setIsLinuxApplication(isLinuxApp(site));
        setIsContainerApplication(isContainerApp(site));
        setIsFunctionApplication(isFunctionApp(site));
        setIsKubeApplication(isKubeApp(site));
        setSiteAppEditState(editMode);
      }
    }
  }, []);

  return (
    <div className={iconStyles(theme)}>
      <SiteRouterContext.Provider value={siteRouterData}>
        <StartupInfoContext.Consumer>
          {value => {
            if (value.token) {
              const resourceId = value.resourceId;
              if (site) {
                return (
                  <SiteStateContext.Provider
                    value={{
                      site,
                      siteAppEditState,
                      stopped,
                      resourceId,
                      isLinuxApp: isLinuxApplication,
                      isContainerApp: isContainerApplication,
                      isFunctionApp: isFunctionApplication,
                      isKubeApp: isKubeApplication,
                      refresh: () => fetchDataAndSetState(resourceId),
                    }}>
                    <Router>
                      {/* NOTE(michinoy): The paths should be always all lowercase. */}
                      <AppSettingsLoadable resourceId={resourceId} tab={value.featureInfo?.data?.tab} path="/settings" />
                      <LogStreamLoadable resourceId={resourceId} path="/log-stream" />
                      <ChangeAppPlanLoadable resourceId={resourceId} path="/changeappplan" />
                      <FunctionIntegrateLoadable resourceId={resourceId} path="/integrate" />
                      <FunctionBindingLoadable resourceId={resourceId} path="/bindingeditor" />
                      <FunctionNewCreatePreviewLoadable resourceId={resourceId} path="/newcreatepreview" />
                      <FunctionAppKeysLoadable resourceId={resourceId} path="/appkeys" />
                      <FunctionKeysLoadable resourceId={resourceId} path="/functionkeys" />
                      <FunctionEditorLoadable resourceId={resourceId} path="/functioneditor" />
                      <FunctionQuickstart resourceId={resourceId} path="/functionquickstart" />
                      <AppFilesLoadable resourceId={resourceId} path="/appfiles" />
                      <FunctionMonitor resourceId={resourceId} path="/monitor" />
                      <DeploymentCenter resourceId={resourceId} tab={value.featureInfo?.data?.tab} path="/deploymentcenter" />
                    </Router>
                  </SiteStateContext.Provider>
                );
              } else {
                fetchDataAndSetState(resourceId);
                return <LoadingComponent />;
              }
            } else {
              return null;
            }
          }}
        </StartupInfoContext.Consumer>
      </SiteRouterContext.Provider>
    </div>
  );
};
export default SiteRouter;
