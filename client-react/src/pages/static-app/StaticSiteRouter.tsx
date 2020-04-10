import { RouteComponentProps, Router } from '@reach/router';
import React, { useContext } from 'react';
import { ThemeContext } from '../../ThemeContext';
import { iconStyles } from '../../theme/iconStyles';
import { StartupInfoContext } from '../../StartupInfoContext';

export interface StaticSiteRouterProps {
  subscriptionId?: string;
  resourcegroup?: string;
  staticSiteName?: string;
}

const StaticSiteRouter: React.FC<RouteComponentProps<StaticSiteRouterProps>> = props => {
  const theme = useContext(ThemeContext);

  return (
    <main className={iconStyles(theme)}>
      <StartupInfoContext.Consumer>
        {value => {
          return value.token && <Router>{`StaticSite Router`}</Router>;
        }}
      </StartupInfoContext.Consumer>
    </main>
  );
};

export default StaticSiteRouter;
