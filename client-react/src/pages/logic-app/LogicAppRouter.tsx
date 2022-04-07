import { RouteComponentProps, Router } from '@reach/router';
import React, { lazy, useContext, useMemo } from 'react';
import { StartupInfoContext } from '../../StartupInfoContext';
import { iconStyles } from '../../theme/iconStyles';
import { ThemeContext } from '../../ThemeContext';

const LogicAppPlanPickerLoadable = lazy(() =>
  import(/* webpackChunkName:"logicappplanpicker" */ './planpicker/LogicAppPlanPickerDataLoader')
);

export interface LogicAppRouterProps {
  subscriptionId?: string;
}

const LogicAppRouter: React.FC<RouteComponentProps<LogicAppRouterProps>> = () => {
  const theme = useContext(ThemeContext);
  const className = useMemo(() => iconStyles(theme), [theme]);

  return (
    <main className={className}>
      <StartupInfoContext.Consumer>
        {({ featureInfo, token }) =>
          token && (
            <Router>
              <LogicAppPlanPickerLoadable currentPlan={featureInfo.data?.currentPlan ?? ''} path="/logicappplanpicker" />
            </Router>
          )
        }
      </StartupInfoContext.Consumer>
    </main>
  );
};

export default LogicAppRouter;
