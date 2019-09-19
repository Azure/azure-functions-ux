import React, { useEffect, useState, lazy, useContext } from 'react';
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
  const [resourceId, setResourceId] = useState('');
  const theme = useContext(ThemeContext);

  useEffect(() => {
    const { subscriptionId, resourcegroup, siteName, slotName, functionName } = props;
    let id = `/subscriptions/${subscriptionId}/resourcegroups/${resourcegroup}/providers/Microsoft.Web/sites/${siteName}`;
    if (slotName) {
      id = `${id}/slots/${slotName}`;
    }

    if (functionName) {
      id = `${id}/functions/${functionName}`;
    }

    setResourceId(id);
  }, []);

  return (
    <main className={iconStyles(theme)}>
      <StartupInfoContext.Consumer>
        {value => {
          return (
            value.token && (
              <Router>
                <AppSettingsLoadable resourceId={resourceId} path="/settings" />
                <LogStreamLoadable resourceId={resourceId} path="/log-stream" />
                <ChangeAppPlanLoadable resourceId={resourceId} path="/changeappplan" />
                <FunctionIntegrateLoadable resourceId={resourceId} path="/integrate" />
                <FunctionBindingEditorLoadable resourceId={resourceId} path="/bindingeditor" />
                <FunctionCreateLoadable resourceId={resourceId} path="/functioncreate" />
                <FunctionAppKeysLoadable resourceId={resourceId} path="/appkeys" />
              </Router>
            )
          );
        }}
      </StartupInfoContext.Consumer>
    </main>
  );
};
export default AppServiceRouter;
