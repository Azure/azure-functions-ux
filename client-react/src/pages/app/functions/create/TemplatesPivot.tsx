import React, { useState } from 'react';
import CreateCard from './CreateCard';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { PivotState } from './FunctionCreate';
import { SearchBox } from 'office-ui-fabric-react';
import { filterBoxStyle } from './FunctionCreate.styles';

interface TemplatesPivotProps {
  functionTemplates: FunctionTemplate[];
  setPivotStateKey: (PivotState) => void;
}

const TemplatesPivot: React.FC<TemplatesPivotProps> = props => {
  const { functionTemplates, setPivotStateKey } = props;
  setPivotStateKey(PivotState.templates);
  const [filterValue, setFilterValue] = useState<string | undefined>(undefined);
  return (
    <>
      <SearchBox
        id="create-functions-search"
        className="ms-slideDownIn20"
        styles={filterBoxStyle}
        placeholder={'Search by template name'}
        onChange={newValue => setFilterValue(newValue)}
      />
      {!!functionTemplates &&
        functionTemplates
          .filter(template => {
            return !filterValue || template.metadata.name.toLowerCase().includes(filterValue.toLowerCase());
          })
          .map((template, index) => {
            return <CreateCard functionTemplate={template} key={index} setPivotStateKey={setPivotStateKey} />;
          })}
    </>
  );
};

export default TemplatesPivot;
