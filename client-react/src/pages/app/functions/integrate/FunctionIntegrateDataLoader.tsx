import React from 'react';
import LoadingComponent from '../../../../components/loading/loading-component';
import { ArmObj } from '../../../../models/arm-obj';
import { FunctionInfo } from '../../../../models/functions/function-info';
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

    functionIntegrateData.getFunction(resourceId).then(r => {
      if (r.metadata.success) {
        this.setState({
          ...this.state,
          functionInfo: r.data,
          isLoading: false,
        });
      } else {
        LogService.error(LogCategories.functionIntegrate, 'getFunction', `Failed to get function: ${r.metadata.error}`);
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
