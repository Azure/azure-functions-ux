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
  const { functionTemplates } = props;
  const [pivotStateKey, setPivotStateKey] = useState<PivotState | undefined>(undefined);

  return (
    <>
      <div style={paddingStyle}>
        <h2>New function</h2>
        <p>
          {'Create a new function in this Function App. You can start by selecting from a template below or '}
          <Link href={Links.applicationSettingsInfo} target="_blank" className={learnMoreLinkStyle}>
            {'go to the quickstart.'}
          </Link>
        </p>
        <Pivot getTabId={getPivotTabId} selectedKey={pivotStateKey}>
          <PivotItem
            onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
              CustomTabRenderer(link, defaultRenderer, theme)
            }
            itemKey={PivotState.templates}
            headerText={'Templates'}>
            <TemplatesPivot functionTemplates={functionTemplates} setPivotStateKey={setPivotStateKey} />
          </PivotItem>
          <PivotItem
            onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
              CustomTabRenderer(link, defaultRenderer, theme)
            }
            itemKey={PivotState.details}
            headerText={'Details'}>
            <DetailsPivot {...props} />
          </PivotItem>
        </Pivot>
      </div>
      {/*<CreateFunctionCommandBar />*/}
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
