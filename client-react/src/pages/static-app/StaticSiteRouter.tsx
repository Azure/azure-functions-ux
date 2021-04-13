import { RouteComponentProps, Router } from '@reach/router';
import React, { useContext, lazy } from 'react';
import { ThemeContext } from '../../ThemeContext';
import { iconStyles } from '../../theme/iconStyles';
import { StartupInfoContext } from '../../StartupInfoContext';

const ConfigurationLoadable: any = lazy(() => import(/* webpackChunkName: "configuration" */ './configuration/ConfigurationDataLoader'));

const StaticSiteSkuPickerLoadable: any = lazy(() =>
  import(/* webpackChunkName:"staticsiteskupicker" */ './skupicker/StaticSiteSkuPickerDataLoader')
);

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
          return (
            value.token && (
              <Router>
                <ConfigurationLoadable resourceId={value.resourceId} path="/configuration" />
                <StaticSiteSkuPickerLoadable
                  resourceId={value.resourceId}
                  isStaticSiteCreate={false}
                  currentSku={''}
                  path="/staticsiteskupicker"
                />
              </Router>
            )
          );
        }}
      </StartupInfoContext.Consumer>
    </main>
  );
};

export default StaticSiteRouter;
