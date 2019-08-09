import React from 'react';
import CreateCard from './CreateCard';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { PivotState } from './FunctionCreate';

interface TemplatesPivotProps {
  functionTemplates: FunctionTemplate[];
  setKey: (PivotState) => void;
}

const TemplatesPivot: React.FC<TemplatesPivotProps> = props => {
  const { functionTemplates, setKey } = props;
  setKey(PivotState.templates);
  return (
    <>
      {!!functionTemplates &&
        functionTemplates.map((template, index) => {
          return <CreateCard functionTemplate={template} key={index} setKey={setKey} />;
        })}
    </>
  );
};

export default TemplatesPivot;
