import React, { useState } from 'react';
import CreateCard from './CreateCard';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { PivotState } from './FunctionCreate';
import { SearchBox } from 'office-ui-fabric-react';
import { filterBoxStyle } from './FunctionCreate.styles';
import { useTranslation } from 'react-i18next';

interface TemplatesPivotProps {
  functionTemplates: FunctionTemplate[];
  setSelectedFunctionTemplate: (FunctionTemplate) => void;
  setPivotStateKey: (PivotState) => void;
}

const TemplatesPivot: React.FC<TemplatesPivotProps> = props => {
  const { functionTemplates, setSelectedFunctionTemplate, setPivotStateKey } = props;
  const { t } = useTranslation();
  setPivotStateKey(PivotState.templates);
  const [filterValue, setFilterValue] = useState<string | undefined>(undefined);
  return (
    <>
      <SearchBox
        id="create-functions-search"
        styles={filterBoxStyle}
        placeholder={t('functionCreate_searchByTemplateName')}
        onChange={newValue => setFilterValue(newValue)}
      />
      {!!functionTemplates &&
        functionTemplates
          .filter(template => {
            return !filterValue || template.metadata.name.toLowerCase().includes(filterValue.toLowerCase());
          })
          .map((template, index) => {
            return (
              <CreateCard
                functionTemplate={template}
                key={index}
                setSelectedFunctionTemplate={setSelectedFunctionTemplate}
                setPivotStateKey={setPivotStateKey}
              />
            );
          })}
    </>
  );
};

export default TemplatesPivot;
