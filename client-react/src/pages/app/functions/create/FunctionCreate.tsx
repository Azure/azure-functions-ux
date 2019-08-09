import React, { useContext } from 'react';
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

const paddingStyle = {
  padding: '20px',
};

export const FunctionCreate: React.SFC<FunctionCreateProps> = props => {
  const theme = useContext(ThemeContext);

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
        <Pivot getTabId={getPivotTabId}>
          <PivotItem
            onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
              CustomTabRenderer(link, defaultRenderer, theme)
            }
            itemKey="templates"
            headerText={'Templates'}>
            <TemplatesPivot {...props} />
          </PivotItem>
          <PivotItem
            onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
              CustomTabRenderer(link, defaultRenderer, theme)
            }
            itemKey="details"
            headerText={'Details'}>
            <DetailsPivot {...props} />
          </PivotItem>
        </Pivot>
      </div>
      {/*<CreateFunctionCommandBar />*/}
    </>
  );
};

const getPivotTabId = (itemKey: string, index: number) => {
  switch (itemKey) {
    case 'templates':
      return 'function-create-templates-tab';
    case 'details':
      return 'function-create-details-tab';
  }
  return '';
};
