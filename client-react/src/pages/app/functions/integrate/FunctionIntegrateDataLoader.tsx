import React from 'react';
import LoadingComponent from '../../../../components/loading/loading-component';
import { ArmObj } from '../../../../models/arm-obj';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { LogCategories } from '../../../../utils/LogCategories';
import LogService from '../../../../utils/LogService';
import { FunctionIntegrate } from './FunctionIntegrate';
import FunctionIntegrateData from './FunctionIntegrate.data';
import { Binding } from '../../../../models/functions/binding';

const functionIntegrateData = new FunctionIntegrateData();
export const FunctionIntegrateContext = React.createContext(functionIntegrateData);

interface FunctionIntegrateDataLoaderProps {
  resourceId: string;
}

interface FunctionIntegrateDataLoaderState {
  functionInfo: ArmObj<FunctionInfo> | undefined;
  bindings: Binding[] | undefined;
}

class FunctionIntegrateDataLoader extends React.Component<FunctionIntegrateDataLoaderProps, FunctionIntegrateDataLoaderState> {
  constructor(props: FunctionIntegrateDataLoaderProps) {
    super(props);

    this.state = {
      functionInfo: undefined,
      bindings: undefined,
    };
  }

  public componentWillMount() {
    this._loadFunction();
    this._loadBindings();
  }

  public render() {
    if (!this.state.functionInfo || !this.state.bindings) {
      return <LoadingComponent />;
    }

    return (
      <FunctionIntegrate functionInfo={this.state.functionInfo} bindings={this.state.bindings} setRequiredBindingId={this._loadBinding} />
    );
  }

  private _loadFunction() {
    const { resourceId } = this.props;

    functionIntegrateData.getFunction(resourceId).then(r => {
      if (r.metadata.success) {
        this.setState({
          ...this.state,
          functionInfo: r.data,
        });
      } else {
        LogService.error(LogCategories.functionIntegrate, 'getFunction', `Failed to get function: ${r.metadata.error}`);
      }
    });
  }

  private _loadBindings() {
    const { resourceId } = this.props;

    const functionAppId = resourceId.split('/functions')[0];
    functionIntegrateData.getBindings(functionAppId).then(r => {
      if (r.metadata.success) {
        this.setState({
          ...this.state,
          bindings: r.data.properties,
        });
      } else {
        LogService.error(LogCategories.functionIntegrate, 'getBindings', `Failed to get bindings: ${r.metadata.error}`);
      }
    });
  }

  private _loadBinding = (bindingId: string) => {
    const { resourceId } = this.props;
    const functionAppId = resourceId.split('/functions')[0];
    functionIntegrateData.getBinding(functionAppId, bindingId).then(r => {
      if (r.metadata.success) {
        const newBinding: Binding = r.data.properties[0];
        const bindings = this.state.bindings || [];
        const existingBindingIndex = bindings.findIndex(binding => binding.id === newBinding.id);
        existingBindingIndex === -1 ? bindings.push(newBinding) : (bindings[existingBindingIndex] = newBinding);

        this.setState({
          ...this.state,
          bindings,
        });
      } else {
        LogService.error(LogCategories.functionIntegrate, 'getBinding', `Failed to get binding: ${r.metadata.error}`);
      }
    });
  };
}

export default FunctionIntegrateDataLoader;
