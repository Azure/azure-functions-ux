import * as React from 'react';
import { ScenarioService } from '../../utils/scenario-checker/scenario.service';

export interface IScenarioCheckerProps {
  scenario: string;
  renderOnSuccess: any;
  renderOnFail: any;
  input?: any;
}

export default class ScenarioChecker extends React.Component<IScenarioCheckerProps, any> {
  public async componentWillMount() {
    this.setState({
      passScenario: null,
      loading: true,
    });
    const { scenario, input } = this.props;
    const scenChecker = new ScenarioService();
    const passScen = await scenChecker.checkScenarioAsync(scenario, input);
    this.setState({
      passScenario: passScen,
      loading: false,
    });
  }
  public render() {
    if (this.state.loading) {
      return <div> Loading...</div>;
    }
    if (!this.state.passScenario || this.state.passScenario.status !== 'disabled') {
      return this.props.renderOnSuccess();
    }
    return this.props.renderOnFail();
  }
}
