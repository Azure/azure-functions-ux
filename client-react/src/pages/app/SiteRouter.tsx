import React, { lazy, useContext, createContext, useEffect, useState } from 'react';
import { RouteComponentProps, Router } from '@reach/router';
import { StartupInfoContext } from '../../StartupInfoContext';
import { iconStyles } from '../../theme/iconStyles';
import { ThemeContext } from '../../ThemeContext';
import { SiteRouterData } from './SiteRouter.data';
import { SiteStateContext } from '../../SiteStateContext';
import { SiteState } from '../../models/portal-models';
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
  const [resourceId, setResourceId] = useState<string | undefined>(undefined);

  const fetchData = async () => {
    // TODO [krmitta]: Add the logic for read-only permissions on the site
  };

  useEffect(() => {
    if (!!resourceId) {
      fetchData();
    }

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
                <SiteStateContext.Provider value={SiteState.readwrite}>
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
