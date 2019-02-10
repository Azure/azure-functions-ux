import React, { useEffect, useState } from 'react';
import Loadable from 'react-loadable';

import { RouteComponentProps, Router } from '@reach/router';

import LoadingComponent from '../../components/loading/loading-component';
import { StartupInfoContext } from '../../StartupInfoContext';

export interface AppSeriviceRouterProps {
  subscriptionId?: string;
  siteName?: string;
  slotName?: string;
  resourcegroup?: string;
}
const AppSettingsLoadable: any = Loadable({
  loader: () => import(/* webpackChunkName:"appsettings" */ './app-settings/AppSettings'),
  loading: LoadingComponent,
});
const LogStreamLoadable: any = Loadable({
  loader: () => import(/* webpackChunkName:"logstream" */ './log-stream/LogStreamDataLoader'),
  loading: LoadingComponent,
});

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
