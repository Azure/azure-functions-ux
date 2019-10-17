import React from 'react';
import { ArmObj } from '../../../../models/arm-obj';
import { FunctionInfo } from '../../../../models/functions/function-info';
import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import LoadingComponent from '../../../../components/loading/loading-component';
import { FunctionEditor } from './FunctionEditor';

// TODO(shimedh): Update this file by adding more data in state and more calls as needed by the editor.
interface FunctionEditorDataLoaderProps {
  resourceId: string;
}

interface FunctionEditorDataLoaderState {
  functionInfo: ArmObj<FunctionInfo> | null;
  isLoading: boolean;
}

class FunctionEditorDataLoader extends React.Component<FunctionEditorDataLoaderProps, FunctionEditorDataLoaderState> {
  constructor(props: FunctionEditorDataLoaderProps) {
    super(props);

    this.state = {
      functionInfo: null,
      isLoading: true,
    };
  }

  public componentWillMount() {
    const { resourceId } = this.props;

    FunctionsService.getFunction(resourceId).then(r => {
      if (r.metadata.success) {
        this.setState({
          ...this.state,
          functionInfo: r.data,
          isLoading: false,
        });
      } else {
        // TODO(shimedh): log error
      }
    });
  }

  public render() {
    if (this.state.isLoading) {
      return <LoadingComponent />;
    }

    const functionInfo = this.state.functionInfo as ArmObj<FunctionInfo>;

    return <FunctionEditor functionInfo={functionInfo} />;
  }
}

export default FunctionEditorDataLoader;
