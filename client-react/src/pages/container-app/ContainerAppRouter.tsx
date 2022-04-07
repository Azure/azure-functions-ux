import { RouteComponentProps, Router } from '@reach/router';
import React, { useContext, lazy } from 'react';
import { ThemeContext } from '../../ThemeContext';
import { iconStyles } from '../../theme/iconStyles';
import { StartupInfoContext } from '../../StartupInfoContext';

const ConsoleLoadable: any = lazy(() => import(/* webpackChunkName: "containerappconsole" */ './console/ConsoleDataLoader'));

export interface ContainerAppRouterProps {
  subscriptionId?: string;
  resourcegroup?: string;
  appName?: string;
}

const ContainerAppRouter: React.FC<RouteComponentProps<ContainerAppRouterProps>> = props => {
  const theme = useContext(ThemeContext);

  return (
    <main className={iconStyles(theme)}>
      <StartupInfoContext.Consumer>
        {value => {
          return (
            value.token && (
              <Router>
                <ConsoleLoadable resourceId={value.resourceId} {...value.featureInfo.data} path="/containerappconsole" />
              </Router>
            )
          );
        }}
      </StartupInfoContext.Consumer>
    </main>
  );
};

export default ContainerAppRouter;
