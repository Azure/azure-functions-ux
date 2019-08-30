import React from 'react';
import LoadingComponent from '../../../../components/loading/loading-component';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import { FunctionCreate } from './FunctionCreate';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { ArmObj } from '../../../../models/arm-obj';
import { BindingsConfig } from '../../../../models/functions/bindings-config';
import FunctionCreateData from './FunctionCreate.data';

const functionCreateData = new FunctionCreateData();
export const FunctionCreateContext = React.createContext(functionCreateData);

export interface FunctionCreateDataLoaderProps {
  resourceId: string;
}

export interface FunctionCreateDataLoaderState {
  functionTemplates: FunctionTemplate[] | null;
  functionsInfo: ArmObj<FunctionInfo>[] | null;
  bindingsConfig: BindingsConfig | null;
}

class FunctionCreateDataLoader extends React.Component<FunctionCreateDataLoaderProps, FunctionCreateDataLoaderState> {
  constructor(props: FunctionCreateDataLoaderProps) {
    super(props);

    this.state = {
      functionTemplates: null,
      functionsInfo: null,
      bindingsConfig: null,
    };
  }

  public componentWillMount() {
    this._loadTemplates();
    this._loadFunctions();
    this._loadBindings();
  }

  public render() {
    if (!this.state.functionTemplates || !this.state.functionsInfo || !this.state.bindingsConfig) {
      return <LoadingComponent />;
    }

    const { resourceId } = this.props;
    const functionTemplates = this.state.functionTemplates as FunctionTemplate[];
    const functionsInfo = this.state.functionsInfo as ArmObj<FunctionInfo>[];
    const bindingsConfig = this.state.bindingsConfig as BindingsConfig;

    return (
      <FunctionCreateContext.Provider value={functionCreateData}>
        <FunctionCreate
          functionTemplates={functionTemplates}
          functionsInfo={functionsInfo}
          bindingsConfig={bindingsConfig}
          resourceId={resourceId}
        />
      </FunctionCreateContext.Provider>
    );
  }

  private _loadTemplates() {
    functionCreateData.getTemplates().then(r => {
      if (r.metadata.success) {
        this.setState({
          ...this.state,
          functionTemplates: r.data,
        });
      } else {
        LogService.trackEvent(
          LogCategories.functionCreate,
          'getTemplatesMetadata',
          `Failed to get functionTemplatesMetadata: ${r.metadata.error}`
        );
      }
    });
  }

  private _loadFunctions() {
    const { resourceId } = this.props;

    functionCreateData.getFunctions(resourceId).then(r => {
      if (r.metadata.success) {
        this.setState({
          ...this.state,
          functionsInfo: r.data.value,
        });
      } else {
        LogService.trackEvent(LogCategories.functionCreate, 'getFunctions', `Failed to get functions: ${r.metadata.error}`);
      }
    });
  }

  private _loadBindings() {
    functionCreateData.getBindings().then(r => {
      if (r.metadata.success) {
        this.setState({
          ...this.state,
          bindingsConfig: r.data,
        });
      } else {
        LogService.trackEvent(
          LogCategories.functionCreate,
          'getBindingConfigMetadata',
          `Failed to get bindingConfigMetadata: ${r.metadata.error}`
        );
      }
    });
  }
}

export default FunctionCreateDataLoader;
