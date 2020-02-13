import React from 'react';
import LoadingComponent from '../../../../components/Loading/LoadingComponent';
import { ArmObj } from '../../../../models/arm-obj';
import { Binding } from '../../../../models/functions/binding';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { HostStatus } from '../../../../models/functions/host-status';
import { LogCategories } from '../../../../utils/LogCategories';
import LogService from '../../../../utils/LogService';
import { FunctionIntegrate } from './FunctionIntegrate';
import FunctionIntegrateData from './FunctionIntegrate.data';

const functionIntegrateData = new FunctionIntegrateData();
export const FunctionIntegrateContext = React.createContext(functionIntegrateData);

interface FunctionIntegrateDataLoaderProps {
  resourceId: string;
}

interface FunctionIntegrateDataLoaderState {
  functionAppId: string;
  functionInfo: ArmObj<FunctionInfo> | undefined;
  bindings: Binding[] | undefined;
  hostStatus: HostStatus | undefined;
}

class FunctionIntegrateDataLoader extends React.Component<FunctionIntegrateDataLoaderProps, FunctionIntegrateDataLoaderState> {
  constructor(props: FunctionIntegrateDataLoaderProps) {
    super(props);

    this.state = {
      functionAppId: props.resourceId.split('/functions')[0],
      functionInfo: undefined,
      bindings: undefined,
      hostStatus: undefined,
    };
  }

  public componentWillMount() {
    this._loadFunction();
    this._loadBindings();
    this._loadHostStatus();
  }

  public render() {
    if (!this.state.functionInfo || !this.state.bindings || !this.state.hostStatus) {
      return <LoadingComponent />;
    }

    return (
      <FunctionIntegrate
        bindings={this.state.bindings}
        functionAppId={this.state.functionAppId}
        functionInfo={this.state.functionInfo}
        setRequiredBindingId={this._loadBinding}
        hostStatus={this.state.hostStatus}
      />
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
    functionIntegrateData.getBindings(this.state.functionAppId).then(r => {
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
    functionIntegrateData.getBinding(this.state.functionAppId, bindingId).then(r => {
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

  private _loadHostStatus() {
    functionIntegrateData.getHostStatus(this.state.functionAppId).then(r => {
      if (r.metadata.success) {
        this.setState({
          ...this.state,
          hostStatus: r.data.properties,
        });
      } else {
        LogService.trackEvent(LogCategories.functionIntegrate, 'getHostStatus', `Failed to get hostStatus: ${r.metadata.error}`);
      }
    });
  }
}

export default FunctionIntegrateDataLoader;
