import React, { lazy, useContext } from 'react';
import { RouteComponentProps, Router } from '@reach/router';
import { StartupInfoContext } from '../../StartupInfoContext';
import { iconStyles } from '../../theme/iconStyles';
import { ThemeContext } from '../../ThemeContext';
export interface AppSeriviceRouterProps {
  subscriptionId?: string;
  resourcegroup?: string;
  siteName?: string;
  slotName?: string;
  functionName?: string;
  resourceId?: string;
}

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

const AppServiceRouter: React.FC<RouteComponentProps<AppSeriviceRouterProps>> = props => {
  const theme = useContext(ThemeContext);

  return (
    <main className={iconStyles(theme)}>
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
              </Router>
            )
          );
        }}
      </StartupInfoContext.Consumer>
    </main>
  );
};
export default AppServiceRouter;
