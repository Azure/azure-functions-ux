import React, { useState } from 'react';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { ArmObj } from '../../../../models/arm-obj';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { Pivot, PivotItem } from 'office-ui-fabric-react';
import TemplatesPivot from './TemplatesPivot';
import DetailsPivot from './DetailsPivot';
import { useTranslation } from 'react-i18next';
import { Binding } from '../../../../models/functions/binding';
import { paddingStyle } from './FunctionCreate.styles';
import { HostStatus } from '../../../../models/functions/host-status';

export interface FunctionCreateProps {
  functionTemplates: FunctionTemplate[];
  functionsInfo: ArmObj<FunctionInfo>[] | undefined;
  bindings: Binding[] | undefined;
  resourceId: string;
  setRequiredBindingIds: (ids: string[]) => void;
  hostStatus: HostStatus;
}

export enum PivotState {
  templates = 'templates',
  details = 'details',
}

export const FunctionCreate: React.SFC<FunctionCreateProps> = props => {
  const { t } = useTranslation();
  const { functionTemplates, functionsInfo, bindings, resourceId, setRequiredBindingIds, hostStatus } = props;
  const [pivotStateKey, setPivotStateKey] = useState<PivotState>(PivotState.templates);
  const [selectedFunctionTemplate, setSelectedFunctionTemplate] = useState<FunctionTemplate | undefined>(undefined);

  const onPivotItemClicked = (item?: PivotItem) => {
    if (!!item) {
      setPivotStateKey(item.props.itemKey as PivotState);
    }
  };

  return (
    <>
      <div style={paddingStyle}>
        <h2>{t('functionCreate_newFunction')}</h2>
        <p>{t('functionCreate_createFunctionMessage')}</p>
        <Pivot getTabId={getPivotTabId} selectedKey={pivotStateKey} onLinkClick={onPivotItemClicked}>
          <PivotItem itemKey={PivotState.templates} headerText={t('functionCreate_templates')}>
            <TemplatesPivot
              functionTemplates={functionTemplates}
              setSelectedFunctionTemplate={setSelectedFunctionTemplate}
              setPivotStateKey={setPivotStateKey}
              setRequiredBindingIds={setRequiredBindingIds}
              bindings={bindings}
              hostStatus={hostStatus}
            />
          </PivotItem>
          <PivotItem itemKey={PivotState.details} headerText={t('functionCreate_details')}>
            <DetailsPivot
              functionsInfo={functionsInfo}
              bindings={bindings}
              selectedFunctionTemplate={selectedFunctionTemplate}
              resourceId={resourceId}
            />
          </PivotItem>
        </Pivot>
      </div>
    </>
  );
};

const getPivotTabId = (itemKey: string) => {
  switch (itemKey) {
    case PivotState.templates:
      return 'function-create-templates-tab';
    case PivotState.details:
      return 'function-create-details-tab';
  }
  return '';
};
