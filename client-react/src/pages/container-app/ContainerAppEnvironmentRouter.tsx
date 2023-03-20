import { RouteComponentProps, Router } from '@reach/router';
import React, { useContext, lazy } from 'react';
import { StartupInfoContext } from '../../StartupInfoContext';
import { iconStyles } from '../../theme/iconStyles';
import { ThemeContext } from '../../ThemeContext';

const LogStreamDataLoader: any = lazy(() => import(/* webpackChunkName: "containerapplogstream" */ './log-stream/LogStreamDataLoader'));

export interface ContainerAppEnvironmentRouterProps {
  subscriptionId?: string;
  resourcegroup?: string;
  envName?: string;
}

const ContainerAppEnvironmentRouter: React.FC<RouteComponentProps<ContainerAppEnvironmentRouterProps>> = () => {
  const theme = useContext(ThemeContext);

  return (
    <main className={iconStyles(theme)}>
      <StartupInfoContext.Consumer>
        {value => {
          return (
            value.token && (
              <Router>
                <LogStreamDataLoader resourceId={value.resourceId} {...value.featureInfo.data} path="*/eventstream" />
              </Router>
            )
          );
        }}
      </StartupInfoContext.Consumer>
    </main>
  );
};

export default ContainerAppEnvironmentRouter;
