import React from 'react';
import LoadingComponent from '../../../../components/loading/loading-component';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import { FunctionCreate } from './FunctionCreate';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { ArmObj } from '../../../../models/arm-obj';
import { BindingConfigMetadata } from '../../../../models/functions/bindings-config';
import FunctionCreateData from './FunctionCreate.data';

export const FunctionCreateContext = React.createContext(new FunctionCreateData());

export interface FunctionCreateDataLoaderProps {
  resourceId: string;
}

export interface FunctionCreateDataLoaderState {
  functionTemplates: FunctionTemplate[] | null;
  functionsInfo: ArmObj<FunctionInfo>[] | null;
  bindingsConfigMetatdata: BindingConfigMetadata[] | null;
}

class FunctionCreateDataLoader extends React.Component<FunctionCreateDataLoaderProps, FunctionCreateDataLoaderState> {
  private functionCreateData = new FunctionCreateData();
  constructor(props: FunctionCreateDataLoaderProps) {
    super(props);

    this.state = {
      functionTemplates: null,
      functionsInfo: null,
      bindingsConfigMetatdata: null,
    };
  }

  public componentWillMount() {
    this._loadTemplates();
    this._loadFunctions();
    this._loadBindings();
  }

  public render() {
    if (!this.state.functionTemplates || !this.state.functionsInfo || !this.state.bindingsConfigMetatdata) {
      return <LoadingComponent />;
    }

    const { resourceId } = this.props;
    const functionCreateData = this.functionCreateData;
    const functionTemplates = this.state.functionTemplates as FunctionTemplate[];
    const functionsInfo = this.state.functionsInfo as ArmObj<FunctionInfo>[];
    const bindingsConfigMetatdata = this.state.bindingsConfigMetatdata as BindingConfigMetadata[];

    return (
      <FunctionCreateContext.Provider value={functionCreateData}>
        <FunctionCreate
          functionTemplates={functionTemplates}
          functionsInfo={functionsInfo}
          bindingsConfigMetatdata={bindingsConfigMetatdata}
          resourceId={resourceId}
        />
      </FunctionCreateContext.Provider>
    );
  }

  private _loadTemplates() {
    this.functionCreateData.getTemplates().then(r => {
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

    this.functionCreateData.getFunctions(resourceId).then(r => {
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
    this.functionCreateData.getBindings().then(r => {
      if (r.metadata.success) {
        this.setState({
          ...this.state,
          bindingsConfigMetatdata: r.data.bindings,
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
