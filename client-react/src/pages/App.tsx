import { Router } from '@reach/router';
import { Fabric } from 'office-ui-fabric-react/lib-commonjs/Fabric';
import * as React from 'react';
import { connect } from 'react-redux';
import AppServiceRouter from './app/AppServiceRouter';
import LandingPage from './LandingPage/LandingPage';
export interface AppProps {
  theme: string;
}

export class App extends React.Component<AppProps, any> {
  public render() {
    return (
      <Fabric>
          <Router>
            <AppServiceRouter path="feature/subscriptions/:subscriptionId/resourcegroups/:resourcegroup/providers/microsoft.web/sites/:siteName/slots/:slotName/*" />
            <AppServiceRouter path="feature/subscriptions/:subscriptionId/resourcegroups/:resourcegroup/providers/microsoft.web/sites/:siteName/*" />
            <LandingPage path="/*" />
          </Router>
      </Fabric>
    );
  }
}

const mapStateToProps = state => {
  return {
    theme: state.portalService && state.portalService.startupInfo && state.portalService.startupInfo.theme,
  };
};

export default connect(
  mapStateToProps,
  null
)(App);
