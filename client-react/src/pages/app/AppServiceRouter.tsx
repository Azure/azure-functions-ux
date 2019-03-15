import React, { useEffect, useState, lazy } from 'react';
import { RouteComponentProps, Router } from '@reach/router';
import { StartupInfoContext } from '../../StartupInfoContext';
export interface AppSeriviceRouterProps {
  subscriptionId?: string;
  siteName?: string;
  slotName?: string;
  resourcegroup?: string;
}

const AppSettingsLoadable: any = lazy(() => import(/* webpackChunkName:"appsettings" */ './app-settings/AppSettings'));
const LogStreamLoadable: any = lazy(() => import(/* webpackChunkName:"logstream" */ './log-stream/LogStreamDataLoader'));

const AppServiceRouter: React.FC<RouteComponentProps<AppSeriviceRouterProps>> = props => {
  const [resourceId, setResourceId] = useState('');
  useEffect(() => {
    const { subscriptionId, resourcegroup, siteName, slotName } = props;
    let id = `/subscriptions/${subscriptionId}/resourcegroups/${resourcegroup}/providers/Microsoft.Web/sites/${siteName}`;
    if (slotName) {
      id = `${id}/slots/${slotName}`;
    }
    setResourceId(id);
  }, []);

  return (
    <main>
      <StartupInfoContext.Consumer>
        {value => {
          return (
            value.token && (
              <Router>
                <AppSettingsLoadable resourceId={resourceId} path="/settings" />
                <LogStreamLoadable resourceId={resourceId} path="/log-stream" />
              </Router>
            )
          );
        }}
      </StartupInfoContext.Consumer>
    </main>
  );
};
export default AppServiceRouter;
