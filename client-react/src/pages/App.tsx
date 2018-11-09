import { Router } from '@reach/router';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import * as React from 'react';
import { connect } from 'react-redux';
import AppServiceRouter from './app/AppServiceRouter';
import LandingPage from './LandingPage/LandingPage';
import ErrorLogger from '../components/ErrorBoundry';
import { Customizer } from 'office-ui-fabric-react';
import { FluentCustomizations } from '@uifabric/fluent-theme/lib';

export interface AppProps {
  theme: string;
}

export class App extends React.Component<AppProps, any> {
  public render() {
    if (!this.props.theme) {
      return 'loading';
    }
    return (
      <Fabric>
        <Customizer {...FluentCustomizations}>
          <ErrorLogger>
            <Router>
              <AppServiceRouter path="feature/subscriptions/:subscriptionId/resourcegroups/:resourcegroup/providers/microsoft.web/sites/:siteName/slots/:slotName/*" />
              <AppServiceRouter path="feature/subscriptions/:subscriptionId/resourcegroups/:resourcegroup/providers/microsoft.web/sites/:siteName/*" />
              <LandingPage path="/*" />
            </Router>
          </ErrorLogger>
        </Customizer>
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
