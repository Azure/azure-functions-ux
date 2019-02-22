import React, { useEffect, useState } from 'react';
import { RouteComponentProps, Router } from '@reach/router';
import AppSettings from './app-settings/AppSettings';
import { StartupInfoContext } from '../../StartupInfoContext';
import LogStreamDataLoader from './log-stream/LogStreamDataLoader';
export interface AppSeriviceRouterProps {
  subscriptionId?: string;
  siteName?: string;
  slotName?: string;
  resourcegroup?: string;
}
const AppSettingsLoadable: any = AppSettings;

const LogStreamLoadable: any = LogStreamDataLoader;

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
