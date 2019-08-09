import React from 'react';
import { FunctionCreateProps } from './FunctionCreate';
import CreateCard from './CreateCard';

const TemplatesPivot: React.FC<FunctionCreateProps> = props => {
  const { functionTemplates } = props;
  return (
    <>
      {!!functionTemplates &&
        functionTemplates.map((template, index) => {
          return <CreateCard functionTemplate={template} key={index} />;
        })}
    </>
  );
};

export default TemplatesPivot;
