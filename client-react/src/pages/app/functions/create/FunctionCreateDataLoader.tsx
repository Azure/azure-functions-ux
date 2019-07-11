import React from 'react';
import LoadingComponent from '../../../../components/loading/loading-component';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import { FunctionCreate } from './FunctionCreate';

export interface FunctionCreateDataLoaderProps {
  resourceId: string;
}

export interface FunctionCreateDataLoaderState {
  functionTemplates: FunctionTemplate[] | null;
  isLoading: boolean;
}

class FunctionCreateDataLoader extends React.Component<FunctionCreateDataLoaderProps, FunctionCreateDataLoaderState> {
  constructor(props: FunctionCreateDataLoaderProps) {
    super(props);

    this.state = {
      functionTemplates: null,
      isLoading: true,
    };
  }

  public componentWillMount() {
    FunctionsService.getTemplatesMetadata().then(r => {
      if (r.metadata.success) {
        this.setState({
          ...this.state,
          functionTemplates: r.data,
          isLoading: false,
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

  public render() {
    if (this.state.isLoading) {
      return <LoadingComponent />;
    }

    const functionTemplates = this.state.functionTemplates as FunctionTemplate[];

    return <FunctionCreate functionTemplates={functionTemplates} />;
  }
}

export default FunctionCreateDataLoader;
