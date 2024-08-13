import React from 'react';
import { getErrorMessageOrStringify } from '../../../../../ApiHelpers/ArmHelper';
import SiteService from '../../../../../ApiHelpers/SiteService';
import { StartupInfoContext } from '../../../../../StartupInfoContext';
import LoadingComponent from '../../../../../components/Loading/LoadingComponent';
import { ArmObj } from '../../../../../models/arm-obj';
import { Binding } from '../../../../../models/functions/binding';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import { HostStatus } from '../../../../../models/functions/host-status';
import { Site } from '../../../../../models/site/site';
import { LogCategories } from '../../../../../utils/LogCategories';
import { getTelemetryInfo } from '../../../../../utils/TelemetryUtils';
import { ArmFunctionDescriptor } from '../../../../../utils/resourceDescriptors';
import { FunctionIntegrate } from './FunctionIntegrate';
import FunctionIntegrateData from './FunctionIntegrate.data';

const functionIntegrateData = new FunctionIntegrateData();
export const FunctionIntegrateContext = React.createContext(functionIntegrateData);

interface FunctionIntegrateDataLoaderProps {
  resourceId: string;
}

interface FunctionIntegrateDataLoaderState {
  functionAppId: string;
  refresh: boolean;
  /** @prop `undefined` if not loaded, `null` if error while loading, an ARM function object when loaded. */
  functionInfo?: ArmObj<FunctionInfo> | null;
  bindings?: Binding[];
  bindingsError: boolean;
  hostStatus?: HostStatus;
  site?: ArmObj<Site>;
}

class FunctionIntegrateDataLoader extends React.Component<FunctionIntegrateDataLoaderProps, FunctionIntegrateDataLoaderState> {
  constructor(props: FunctionIntegrateDataLoaderProps) {
    super(props);
    const armFunctionDescriptor = new ArmFunctionDescriptor(props.resourceId);

    this.state = {
      functionAppId: armFunctionDescriptor.getSiteOnlyResourceId(),
      functionInfo: undefined,
      bindings: undefined,
      bindingsError: false,
      hostStatus: undefined,
      site: undefined,
      refresh: false,
    };
  }

  public componentDidMount() {
    this._loadSite();
    this._loadFunction();
    this._loadBindings();
    this._loadHostStatus();
  }

  public render() {
    if (!this.state.site || this.state.functionInfo === undefined || !this.state.bindings || !this.state.hostStatus) {
      return <LoadingComponent />;
    }

    return (
      <FunctionIntegrate
        bindings={this.state.bindings}
        bindingsError={this.state.bindingsError}
        functionAppId={this.state.functionAppId}
        functionInfo={this.state.functionInfo}
        hostStatus={this.state.hostStatus}
        isRefreshing={this.state.refresh}
        refreshIntegrate={() => this._refresh()}
        loadBindingSettings={(bindingId: string, force: boolean) => this._loadBindingSettings(bindingId, force)}
      />
    );
  }

  private _setRefreshState(refresh: boolean) {
    this.setState({
      ...this.state,
      refresh,
    });
  }

  private _refresh() {
    if (this.state.site) {
      this._setRefreshState(true);

      SiteService.fireSyncTrigger(this.state.site).then(r => {
        this._loadSite();
        this._loadFunction();
        this._loadHostStatus();
        this._setRefreshState(false);

        if (!r.metadata.success) {
          /** @note (joechung): Portal context is unavailable so log errors to console. */
          console.error(
            getTelemetryInfo('error', LogCategories.functionIntegrate, 'fireSyncTrigger', {
              message: `Failed to fire syncTrigger: ${getErrorMessageOrStringify(r.metadata.error)}`,
            })
          );
        }
      });
    }
  }

  private _loadSite() {
    this._setRefreshState(true);

    SiteService.fetchSite(this.state.functionAppId).then(r => {
      this._setRefreshState(false);

      if (r.metadata.success) {
        this.setState({
          ...this.state,
          site: r.data,
        });
      } else {
        /** @note (joechung): Portal context is unavailable so log errors to console. */
        console.error(
          getTelemetryInfo('error', LogCategories.functionIntegrate, 'fetchSite', {
            message: `Failed to fetch site: ${getErrorMessageOrStringify(r.metadata.error)}`,
          })
        );
      }
    });
  }

  private _loadFunction() {
    const { resourceId } = this.props;

    this._setRefreshState(true);

    functionIntegrateData.getFunction(resourceId).then(r => {
      this._setRefreshState(false);

      if (r.metadata.success) {
        this.setState({
          functionInfo: r.data,
        });
      } else {
        this.setState({
          functionInfo: null,
        });
        /** @note (joechung): Portal context is unavailable so log errors to console. */
        console.error(
          getTelemetryInfo('error', LogCategories.functionIntegrate, 'getFunction', {
            message: `Failed to get function: ${getErrorMessageOrStringify(r.metadata.error)}`,
          })
        );
      }
    });
  }

  private _loadBindings() {
    functionIntegrateData.getBindings(this.state.functionAppId).then(r => {
      if (r.metadata.success) {
        this.setState({
          bindings: r.data.properties,
        });
      } else {
        /** @note (joechung): Portal context is unavailable so log errors to console. */
        console.error(
          getTelemetryInfo('error', LogCategories.functionIntegrate, 'getBindings', {
            message: `Failed to get bindings: ${getErrorMessageOrStringify(r.metadata.error)}`,
          })
        );
        this.setState({
          bindings: [],
          bindingsError: true,
        });
      }
    });
  }

  private _loadBindingSettings = (bindingId: string, force: boolean): Promise<void> => {
    const bindingFromState = this.state.bindings && this.state.bindings.find(binding => binding.id === bindingId);
    if (!force && bindingFromState && bindingFromState.settings) {
      return Promise.resolve();
    }

    return functionIntegrateData.getBinding(this.state.functionAppId, bindingId).then(r => {
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
        /** @note (joechung): Portal context is unavailable so log errors to console. */
        console.error(
          getTelemetryInfo('error', LogCategories.functionIntegrate, 'getBinding', {
            message: `Failed to get binding: ${getErrorMessageOrStringify(r.metadata.error)}`,
          })
        );
        this.setState({ ...this.state, bindingsError: true });
      }
    });
  };

  private _loadHostStatus() {
    this._setRefreshState(true);

    functionIntegrateData.getHostStatus(this.state.functionAppId).then(r => {
      this._setRefreshState(false);

      if (r.metadata.success) {
        this.setState({
          ...this.state,
          hostStatus: r.data.properties,
        });
      } else {
        /** @note (joechung): Portal context is unavailable so log messages to console. */
        console.log(
          getTelemetryInfo('info', LogCategories.functionIntegrate, 'getHostStatus', {
            message: `Failed to get hostStatus: ${getErrorMessageOrStringify(r.metadata.error)}`,
          })
        );
      }
    });
  }
}

FunctionIntegrateDataLoader.contextType = StartupInfoContext;

export default FunctionIntegrateDataLoader;
