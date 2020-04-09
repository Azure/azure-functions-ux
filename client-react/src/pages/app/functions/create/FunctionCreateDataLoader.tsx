import React from 'react';
import LoadingComponent from '../../../../components/Loading/LoadingComponent';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import { FunctionCreate } from './FunctionCreate';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { ArmObj } from '../../../../models/arm-obj';
import { Binding } from '../../../../models/functions/binding';
import FunctionCreateData from './FunctionCreate.data';
import { HostStatus } from '../../../../models/functions/host-status';
import { getErrorMessageOrStringify } from '../../../../ApiHelpers/ArmHelper';

const functionCreateData = new FunctionCreateData();
export const FunctionCreateContext = React.createContext(functionCreateData);

export interface FunctionCreateDataLoaderProps {
  resourceId: string;
}

export interface FunctionCreateDataLoaderState {
  functionTemplates: FunctionTemplate[] | undefined;
  functionsInfo: ArmObj<FunctionInfo>[] | undefined;
  bindings: Binding[] | undefined;
  hostStatus: HostStatus | undefined;
}

class FunctionCreateDataLoader extends React.Component<FunctionCreateDataLoaderProps, FunctionCreateDataLoaderState> {
  constructor(props: FunctionCreateDataLoaderProps) {
    super(props);

    this.state = {
      functionTemplates: undefined,
      functionsInfo: undefined,
      bindings: undefined,
      hostStatus: undefined,
    };
  }

  public componentWillMount() {
    this._loadTemplates();
    this._loadFunctions();
    this._loadHostStatus();
  }

  public render() {
    if (!this.state.functionTemplates || !this.state.hostStatus) {
      return <LoadingComponent />;
    }

    const { resourceId } = this.props;
    const functionTemplates = this.state.functionTemplates;

    return (
      <FunctionCreateContext.Provider value={functionCreateData}>
        <FunctionCreate
          functionTemplates={functionTemplates}
          functionsInfo={this.state.functionsInfo}
          setRequiredBindingIds={this._loadBindings}
          bindings={this.state.bindings}
          hostStatus={this.state.hostStatus}
          resourceId={resourceId}
        />
      </FunctionCreateContext.Provider>
    );
  }

  private _loadTemplates() {
    const { resourceId } = this.props;

    functionCreateData.getTemplates(resourceId).then(r => {
      if (r.metadata.success) {
        this.setState({
          ...this.state,
          functionTemplates: r.data.properties,
        });
      } else {
        LogService.trackEvent(
          LogCategories.functionCreate,
          'getTemplates',
          `Failed to get templates: ${getErrorMessageOrStringify(r.metadata.error)}`
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
        LogService.trackEvent(
          LogCategories.functionCreate,
          'getFunctions',
          `Failed to get functions: ${getErrorMessageOrStringify(r.metadata.error)}`
        );
      }
    });
  }

  private _loadBindings = (ids: string[]) => {
    const { resourceId } = this.props;
    const allBindings: Binding[] = [];
    const promises: Promise<void>[] = [];

    ids.forEach(id => {
      const bindingPromise = functionCreateData.getBinding(resourceId, id).then(r => {
        if (r.metadata.success) {
          allBindings.push(r.data.properties[0]);
        } else {
          LogService.trackEvent(
            LogCategories.functionCreate,
            'getBindings',
            `Failed to get bindings: ${getErrorMessageOrStringify(r.metadata.error)}`
          );
        }
      });
      promises.push(bindingPromise);
    });

    Promise.all(promises).then(() => {
      this.setState({
        ...this.state,
        bindings: allBindings,
      });
    });
  };

  private _loadHostStatus() {
    const { resourceId } = this.props;

    functionCreateData.getHostStatus(resourceId).then(r => {
      if (r.metadata.success) {
        this.setState({
          ...this.state,
          hostStatus: r.data.properties,
        });
      } else {
        LogService.trackEvent(
          LogCategories.functionCreate,
          'getHostStatus',
          `Failed to get hostStatus: ${getErrorMessageOrStringify(r.metadata.error)}`
        );
      }
    });
  }
}

export default FunctionCreateDataLoader;
