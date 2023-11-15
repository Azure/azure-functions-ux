import { RouteComponentProps, Router } from '@gatsbyjs/reach-router';
import React, { lazy, useContext } from 'react';
import { StartupInfoContext } from '../../StartupInfoContext';
import { ThemeContext } from '../../ThemeContext';
import { iconStyles } from '../../theme/iconStyles';

const ConfigurationLoadable: any = lazy(() => import(/* webpackChunkName: "configuration" */ './configuration/ConfigurationDataLoader'));

export interface StaticSiteRouterProps {
  subscriptionId?: string;
  resourcegroup?: string;
  staticSiteName?: string;
}

const StaticSiteRouter: React.FC<RouteComponentProps<StaticSiteRouterProps>> = () => {
  const theme = useContext(ThemeContext);

  return (
    <div className={iconStyles(theme)}>
      <StartupInfoContext.Consumer>
        {value => {
          return (
            value.token && (
              <Router>
                <ConfigurationLoadable resourceId={value.resourceId} path="/configuration" />
              </Router>
            )
          );
        }}
      </StartupInfoContext.Consumer>
    </div>
  );
};

export default StaticSiteRouter;
