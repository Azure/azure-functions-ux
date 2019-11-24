import React, { useState } from 'react';
import CreateCard from './CreateCard';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { PivotState } from './FunctionCreate';
import { SearchBox } from 'office-ui-fabric-react';
import { filterBoxStyle } from './FunctionCreate.styles';
import { useTranslation } from 'react-i18next';
import { Order } from './CreateConstants';

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
          .filter(template => !filterValue || template.metadata.name.toLowerCase().includes(filterValue.toLowerCase()))
          .sort((templateA: FunctionTemplate, templateB: FunctionTemplate) => sortTemplate(templateA, templateB))
          .map((template: FunctionTemplate, index: number) => {
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

const sortTemplate = (templateA: FunctionTemplate, templateB: FunctionTemplate): number => {
  let indexA = Order.templateOrder.findIndex(item => templateA.id.startsWith(item));
  let indexB = Order.templateOrder.findIndex(item => templateB.id.startsWith(item));

  if (indexA === -1) {
    indexA = Number.MAX_VALUE;
  }
  if (indexB === -1) {
    indexB = Number.MAX_VALUE;
  }

  return indexA === indexB ? (templateA.metadata.name > templateB.metadata.name ? 1 : -1) : indexA > indexB ? 1 : -1;
};

export default TemplatesPivot;
