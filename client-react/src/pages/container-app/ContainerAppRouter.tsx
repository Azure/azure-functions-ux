import { RouteComponentProps, Router } from '@reach/router';
import React, { useContext, lazy } from 'react';
import { ThemeContext } from '../../ThemeContext';
import { iconStyles } from '../../theme/iconStyles';
import { StartupInfoContext } from '../../StartupInfoContext';

const ConsoleLoadable: any = lazy(() => import(/* webpackChunkName: "containerappconsole" */ './console/ConsoleDataLoader'));
const LogStreamDataLoader: any = lazy(() => import(/* webpackChunkName: "containerapplogstream" */ './log-stream/LogStreamDataLoader'));

export interface ContainerAppRouterProps {
  subscriptionId?: string;
  resourcegroup?: string;
  appName?: string;
}

const ContainerAppRouter: React.FC<RouteComponentProps<ContainerAppRouterProps>> = () => {
  const theme = useContext(ThemeContext);

  return (
    <div className={iconStyles(theme)}>
      <StartupInfoContext.Consumer>
        {value => {
          return (
            value.token && (
              <Router>
                <ConsoleLoadable resourceId={value.resourceId} {...value.featureInfo.data} path="/containerappconsole" />
                <LogStreamDataLoader resourceId={value.resourceId} {...value.featureInfo.data} path="/containerapplogstream" />
                <LogStreamDataLoader resourceId={value.resourceId} {...value.featureInfo.data} path="/eventstream" />
              </Router>
            )
          );
        }}
      </StartupInfoContext.Consumer>
    </div>
  );
};

export default ContainerAppRouter;
