import React from 'react';
import AppKeyService from '../../../../ApiHelpers/AppKeysService';
import LoadingComponent from '../../../../components/loading/loading-component';
import { ArmObj } from '../../../../models/arm-obj';
import { Binding } from '../../../../models/functions/binding';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { LogCategories } from '../../../../utils/LogCategories';
import LogService from '../../../../utils/LogService';
import { FunctionIntegrate } from './FunctionIntegrate';
import FunctionIntegrateData from './FunctionIntegrate.data';
import { EventGrid } from './FunctionIntegrateConstants';

const functionIntegrateData = new FunctionIntegrateData();
export const FunctionIntegrateContext = React.createContext(functionIntegrateData);

interface FunctionIntegrateDataLoaderProps {
  resourceId: string;
}

interface FunctionIntegrateDataLoaderState {
  functionAppId: string;
  functionAppApplicationSettings: { [key: string]: string };
  functionAppSystemKeys: { [key: string]: string };
  functionInfo: ArmObj<FunctionInfo> | undefined;
  bindings: Binding[] | undefined;
}

class FunctionIntegrateDataLoader extends React.Component<FunctionIntegrateDataLoaderProps, FunctionIntegrateDataLoaderState> {
  constructor(props: FunctionIntegrateDataLoaderProps) {
    super(props);

    this.state = {
      functionAppId: props.resourceId.split('/functions')[0],
      functionAppApplicationSettings: {},
      functionAppSystemKeys: {},
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
      <FunctionIntegrate
        bindings={this.state.bindings}
        functionAppApplicationSettings={this.state.functionAppApplicationSettings}
        functionAppId={this.state.functionAppId}
        functionAppSystemKeys={this.state.functionAppSystemKeys}
        functionInfo={this.state.functionInfo}
        setRequiredBindingId={this._loadBinding}
      />
    );
  }

  private _loadFunctionAppApplicationSettings() {
    functionIntegrateData.getFunctionAppApplicationSettings(this.state.functionAppId).then(r => {
      if (r.metadata.success) {
        this.setState({
          ...this.state,
          functionAppApplicationSettings: r.data.properties,
        });
      } else {
        LogService.error(
          LogCategories.functionIntegrate,
          'getFunctionAppApplicationSettings',
          `Failed to get application settings: ${r.metadata.error}`
        );
      }
    });
  }

  private _loadFunctionAppSystemKeys() {
    AppKeyService.fetchKeys(this.state.functionAppId).then(r => {
      if (r.metadata.success) {
        this.setState({
          ...this.state,
          functionAppSystemKeys: r.data.systemKeys,
        });
      } else {
        LogService.error(LogCategories.functionIntegrate, 'fetchKeys', `Failed to get system keys: ${r.metadata.error}`);
      }
    });
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

    if (bindingId.toLowerCase() === EventGrid.eventGridBindingId) {
      this._loadFunctionAppApplicationSettings();
      this._loadFunctionAppSystemKeys();
    }
  };
}

export default FunctionIntegrateDataLoader;
