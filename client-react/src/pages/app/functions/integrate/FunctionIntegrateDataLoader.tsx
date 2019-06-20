import React from 'react';
import { ArmObj } from '../../../../models/arm-obj';
import { FunctionInfo } from '../../../../models/functions/function-info';
import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import LoadingComponent from '../../../../components/loading/loading-component';
import { FunctionIntegrate } from './FunctionIntegrate';

interface FunctionIntegrateDataLoaderProps {
  resourceId: string;
}

interface FunctionIntegrateDataLoaderState {
  functionInfo: ArmObj<FunctionInfo> | null;
  isLoading: boolean;
}

class FunctionIntegrateDataLoader extends React.Component<FunctionIntegrateDataLoaderProps, FunctionIntegrateDataLoaderState> {
  constructor(props: FunctionIntegrateDataLoaderProps) {
    super(props);

    this.state = {
      functionInfo: null,
      isLoading: true,
    };
  }

  public componentWillMount() {
    const { resourceId } = this.props;

    FunctionsService.fetchFunction(resourceId).then(r => {
      if (r.metadata.success) {
        this.setState({
          ...this.state,
          functionInfo: r.data,
          isLoading: false,
        });
      } else {
        // etodo: log error
      }
    });
  }

  public render() {
    if (this.state.isLoading) {
      return <LoadingComponent />;
    }

    const functionInfo = this.state.functionInfo as ArmObj<FunctionInfo>;

    return <FunctionIntegrate functionInfo={functionInfo} />;
  }
}

export default FunctionIntegrateDataLoader;
