import React, { lazy, useContext, createContext } from 'react';
import { RouteComponentProps, Router } from '@reach/router';
import { StartupInfoContext } from '../../StartupInfoContext';
import { iconStyles } from '../../theme/iconStyles';
import { ThemeContext } from '../../ThemeContext';
import { SiteRouterData } from './SiteRouter.data';
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
const FunctionBindingEditorLoadable: any = lazy(() =>
  import(/* webpackChunkName:"functionbindingeditor" */ './functions/integrate/binding-editor/BindingEditorDataLoader')
);
const FunctionCreateLoadable: any = lazy(() =>
  import(/* webpackChunkName:"functioncreate" */ './functions/create/FunctionCreateDataLoader')
);
const FunctionAppKeysLoadable: any = lazy(() => import(/* webpackChunkName:"functionappkeys" */ './functions/app-keys/AppKeysDataLoader'));

const FunctionKeysLoadable: any = lazy(() =>
  import(/* webpackChunkName: "functionKeys" */ './functions/function-keys/FunctionKeysDataLoader')
);
const FunctionEditorLoadable: any = lazy(() =>
  import(/* webpackChunkName:"functionintegrate" */ './functions/function-editor/FunctionEditorDataLoader')
);

const SiteRouter: React.FC<RouteComponentProps<SiteRouterProps>> = props => {
  const theme = useContext(ThemeContext);

  return (
    <main className={iconStyles(theme)}>
      <SiteRouterContext.Provider value={siteRouterData}>
        <StartupInfoContext.Consumer>
          {value => {
            return (
              value.token && (
                <Router>
                  <AppSettingsLoadable resourceId={value.resourceId} path="/settings" />
                  <LogStreamLoadable resourceId={value.resourceId} path="/log-stream" />
                  <ChangeAppPlanLoadable resourceId={value.resourceId} path="/changeappplan" />
                  <FunctionIntegrateLoadable resourceId={value.resourceId} path="/integrate" />
                  <FunctionBindingEditorLoadable resourceId={value.resourceId} path="/bindingeditor" />
                  <FunctionCreateLoadable resourceId={value.resourceId} path="/functioncreate" />
                  <FunctionAppKeysLoadable resourceId={value.resourceId} path="/appkeys" />
                  <FunctionKeysLoadable resourceId={value.resourceId} path="/functionkeys" />
                  <FunctionEditorLoadable resourceId={value.resourceId} path="/functioneditor" />
                </Router>
              )
            );
          }}
        </StartupInfoContext.Consumer>
      </SiteRouterContext.Provider>
    </main>
  );
};
export default SiteRouter;
