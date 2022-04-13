import { RouteComponentProps, Router } from '@reach/router';
import React, { useContext, lazy } from 'react';
import { ThemeContext } from '../../ThemeContext';
import { iconStyles } from '../../theme/iconStyles';
import { StartupInfoContext } from '../../StartupInfoContext';
import { IStartupInfo } from '../../models/portal-models';

const ConfigurationLoadable: any = lazy(() => import(/* webpackChunkName: "configuration" */ './configuration/ConfigurationDataLoader'));

const StaticSiteSkuPickerLoadable: any = lazy(() =>
  import(/* webpackChunkName:"staticsiteskupicker" */ './skupicker/StaticSiteSkuPickerDataLoader')
);

const isFeatureInfoDataValid = (value: IStartupInfo<any>) => {
  return !!value.featureInfo && !!value.featureInfo.data;
};

export interface StaticSiteRouterProps {
  subscriptionId?: string;
  resourcegroup?: string;
  staticSiteName?: string;
}

const StaticSiteRouter: React.FC<RouteComponentProps<StaticSiteRouterProps>> = () => {
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
                  isStaticSiteCreate={isFeatureInfoDataValid(value) ? value.featureInfo.data.isStaticSiteCreate : true}
                  currentSku={isFeatureInfoDataValid(value) ? value.featureInfo.data.currentSku : ''}
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
