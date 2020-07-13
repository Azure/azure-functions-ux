import React, { useState } from 'react';
import CreateCard from './CreateCard';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { PivotState } from './FunctionCreate';
import { SearchBox, Link, MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { filterBoxStyle } from './FunctionCreate.styles';
import { useTranslation } from 'react-i18next';
import { Order } from './CreateConstants';
import { Binding } from '../../../../models/functions/binding';
import { HostStatus } from '../../../../models/functions/host-status';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { Links } from '../../../../utils/FwLinks';

interface TemplatesPivotProps {
  functionTemplates: FunctionTemplate[];
  setSelectedFunctionTemplate: (FunctionTemplate: FunctionTemplate) => void;
  setPivotStateKey: (PivotState: PivotState) => void;
  setRequiredBindingIds: (Bindings: string[]) => void;
  bindings: Binding[] | undefined;
  hostStatus: HostStatus;
}

const TemplatesPivot: React.FC<TemplatesPivotProps> = props => {
  const { functionTemplates, setSelectedFunctionTemplate, setPivotStateKey, setRequiredBindingIds, hostStatus } = props;
  const { t } = useTranslation();
  const [filterValue, setFilterValue] = useState<string | undefined>(undefined);
  return (
    <>
      {/*Template Search Box*/}
      <SearchBox
        id="create-functions-search"
        styles={filterBoxStyle}
        placeholder={t('functionCreate_searchByTemplateName')}
        onChange={newValue => setFilterValue(newValue)}
      />

      {/*Function Templates*/}
      {!!functionTemplates &&
        functionTemplates
          .filter(template => !filterValue || template.name.toLowerCase().includes(filterValue.toLowerCase()))
          .sort((templateA: FunctionTemplate, templateB: FunctionTemplate) => sortTemplate(templateA, templateB))
          .map((template: FunctionTemplate, index: number) => {
            return (
              <CreateCard
                functionTemplate={template}
                key={index}
                setSelectedFunctionTemplate={setSelectedFunctionTemplate}
                setPivotStateKey={setPivotStateKey}
                setRequiredBindingIds={setRequiredBindingIds}
                hostStatus={hostStatus}
              />
            );
          })}

      {/*Extension Bundles Required Message*/}
      {!hostStatus.version.startsWith('1') && !hostStatus.extensionBundle && (
        <MessageBar messageBarType={MessageBarType.warning} isMultiline={true}>
          {t('functionCreate_extensionBundlesRequired')}
          <Link href={Links.extensionBundlesRequiredLearnMore} target="_blank" className={learnMoreLinkStyle}>
            {t('learnMore')}
          </Link>
        </MessageBar>
      )}
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

  return indexA === indexB ? (templateA.name > templateB.name ? 1 : -1) : indexA > indexB ? 1 : -1;
};

export default TemplatesPivot;
