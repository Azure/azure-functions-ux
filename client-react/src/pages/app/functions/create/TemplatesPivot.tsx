import React from 'react';
import CreateCard from './CreateCard';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { PivotState } from './FunctionCreate';

interface TemplatesPivotProps {
  functionTemplates: FunctionTemplate[];
  setPivotStateKey: (PivotState) => void;
}

const TemplatesPivot: React.FC<TemplatesPivotProps> = props => {
  const { functionTemplates, setPivotStateKey } = props;
  setPivotStateKey(PivotState.templates);
  return (
    <>
      {!!functionTemplates &&
        functionTemplates.map((template, index) => {
          return <CreateCard functionTemplate={template} key={index} setPivotStateKey={setPivotStateKey} />;
        })}
    </>
  );
};

export default TemplatesPivot;
