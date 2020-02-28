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
import SiteService from '../../../../ApiHelpers/SiteService';
import { Site } from '../../../../models/site/site';
import { StartupInfoContext } from '../../../../StartupInfoContext';

const functionIntegrateData = new FunctionIntegrateData();
export const FunctionIntegrateContext = React.createContext(functionIntegrateData);

interface FunctionIntegrateDataLoaderProps {
  resourceId: string;
}

interface FunctionIntegrateDataLoaderState {
  functionAppId: string;
  refresh: boolean;
  functionInfo?: ArmObj<FunctionInfo>;
  bindings?: Binding[];
  hostStatus?: HostStatus;
  site?: ArmObj<Site>;
}

class FunctionIntegrateDataLoader extends React.Component<FunctionIntegrateDataLoaderProps, FunctionIntegrateDataLoaderState> {
  constructor(props: FunctionIntegrateDataLoaderProps) {
    super(props);

    this.state = {
      functionAppId: props.resourceId.split('/functions')[0],
      functionInfo: undefined,
      bindings: undefined,
      hostStatus: undefined,
      site: undefined,
      refresh: false,
    };
  }

  public componentWillMount() {
    this._loadSite();
    this._loadData();
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
        hostStatus={this.state.hostStatus}
        refreshIntegrate={() => this._refresh()}
        isRefreshing={this.state.refresh}
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
    if (!!this.state.site) {
      this._setRefreshState(true);

      SiteService.fireSyncTrigger(this.state.site, this.context.token || '').then(r => {
        this._loadData();
        this._setRefreshState(false);

        if (!r.metadata.success) {
          LogService.error(LogCategories.functionIntegrate, 'fireSyncTrigger', `Failed to fire syncTrigger: ${r.metadata.error}`);
        }
      });
    }
  }

  private _loadData() {
    this._loadFunction();
    this._loadBindings();
    this._loadHostStatus();
  }

  private _loadSite() {
    SiteService.fetchSite(this.state.functionAppId).then(r => {
      if (r.metadata.success) {
        this.setState({
          ...this.state,
          site: r.data,
        });
      } else {
        LogService.error(LogCategories.functionIntegrate, 'fetchSite', `Failed to fetch site: ${r.metadata.error}`);
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
          ...this.state,
          functionInfo: r.data,
        });
      } else {
        LogService.error(LogCategories.functionIntegrate, 'getFunction', `Failed to get function: ${r.metadata.error}`);
      }
    });
  }

  private _loadBindings() {
    this._setRefreshState(true);

    functionIntegrateData
      .getBindings(this.state.functionAppId)
      .then(r => {
        this._setRefreshState(false);

        if (r.metadata.success) {
          this.setState({
            ...this.state,
            bindings: r.data.properties,
          });
        } else {
          LogService.error(LogCategories.functionIntegrate, 'getBindings', `Failed to get bindings: ${r.metadata.error}`);
        }
      })
      .then(() => {
        if (this.state.bindings) {
          Promise.all(this.state.bindings.map(binding => this._loadBindingSettings(binding.id)));
        }
      });
  }

  private _loadBindingSettings = (bindingId: string) => {
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
        LogService.error(LogCategories.functionIntegrate, 'getBinding', `Failed to get binding: ${r.metadata.error}`);
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
        LogService.trackEvent(LogCategories.functionIntegrate, 'getHostStatus', `Failed to get hostStatus: ${r.metadata.error}`);
      }
    });
  }
}

FunctionIntegrateDataLoader.contextType = StartupInfoContext;

export default FunctionIntegrateDataLoader;
