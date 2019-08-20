import React from 'react';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { DefaultButton } from 'office-ui-fabric-react';
import FunctionsService from '../../../../ApiHelpers/FunctionsService';

interface DetailsPivotProps {
  selectedFunctionTemplate: FunctionTemplate | undefined;
  resourceId: string;
}

const DetailsPivot: React.FC<DetailsPivotProps> = props => {
  const { selectedFunctionTemplate, resourceId } = props;
  return (
    <>
      {selectedFunctionTemplate && (
        <DefaultButton onClick={() => onCreateFunctionClicked(resourceId, selectedFunctionTemplate)}>Create Function</DefaultButton>
      )}
    </>
  );
};

const onCreateFunctionClicked = (resourceId: string, functionTemplate: FunctionTemplate) => {
  FunctionsService.createFunction(resourceId, functionTemplate.id, functionTemplate.files, functionTemplate.function);
};

export default DetailsPivot;
