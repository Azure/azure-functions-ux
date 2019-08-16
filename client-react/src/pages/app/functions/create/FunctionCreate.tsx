import React, { useContext, useState } from 'react';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { ArmObj } from '../../../../models/arm-obj';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { Pivot, PivotItem, IPivotItemProps, Link } from 'office-ui-fabric-react';
import CustomTabRenderer from '../../app-settings/Sections/CustomTabRenderer';
import { ThemeContext } from '../../../../ThemeContext';
import TemplatesPivot from './TemplatesPivot';
import DetailsPivot from './DetailsPivot';
import { Links } from '../../../../utils/FwLinks';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { useTranslation } from 'react-i18next';

export interface FunctionCreateProps {
  functionTemplates: FunctionTemplate[];
  functionsInfo: ArmObj<FunctionInfo>[];
}

export enum PivotState {
  templates = 'templates',
  details = 'details',
}

const paddingStyle = {
  padding: '20px',
};

export const FunctionCreate: React.SFC<FunctionCreateProps> = props => {
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();
  const { functionTemplates } = props;
  const [pivotStateKey, setPivotStateKey] = useState<PivotState | undefined>(undefined);

  return (
    <>
      <div style={paddingStyle}>
        <h2>{t('functionCreate_newFunction')}</h2>
        <p>
          {t('functionCreate_createFunctionMessage')}
          <Link href={Links.applicationSettingsInfo} target="_blank" className={learnMoreLinkStyle}>
            {t('functionCreate_goToQuickstart')}
          </Link>
        </p>
        <Pivot getTabId={getPivotTabId} selectedKey={pivotStateKey}>
          <PivotItem
            onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
              CustomTabRenderer(link, defaultRenderer, theme)
            }
            itemKey={PivotState.templates}
            headerText={t('functionCreate_templates')}>
            <TemplatesPivot functionTemplates={functionTemplates} setPivotStateKey={setPivotStateKey} />
          </PivotItem>
          <PivotItem
            onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
              CustomTabRenderer(link, defaultRenderer, theme)
            }
            itemKey={PivotState.details}
            headerText={t('functionCreate_details')}>
            <DetailsPivot {...props} />
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
