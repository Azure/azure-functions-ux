import React, { useContext } from 'react';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { ArmObj } from '../../../../models/arm-obj';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { Pivot, PivotItem, IPivotItemProps } from 'office-ui-fabric-react';
import CustomTabRenderer from '../../app-settings/Sections/CustomTabRenderer';
import { ThemeContext } from '../../../../ThemeContext';
import { useTranslation } from 'react-i18next';
import TemplatesPivot from './TemplatesPivot';
// import { BindingFormBuilder } from '../common/BindingFormBuilder';

export interface FunctionCreateProps {
  functionTemplates: FunctionTemplate[];
  functionsInfo: ArmObj<FunctionInfo>[];
}

const paddingStyle = {
  padding: '20px',
};

export const FunctionCreate: React.SFC<FunctionCreateProps> = props => {
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  // const { functionTemplates } = props;

  // const builder = new BindingFormBuilder(currentBindingInfo, functionTemplates[0].function.bindings[0], t);
  // const initialFormValues = builder.getInitialFormValues();

  return (
    <>
      <div style={paddingStyle}>
        <h2>New function</h2>
        <h3>Create a new function in this Function App. You can start by selecting from a template below or go to the quickstart.</h3>
        <Pivot>
          <PivotItem
            onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
              CustomTabRenderer(link, defaultRenderer, theme)
            }
            itemKey="applicationSettings"
            linkText={t('applicationSettings')}>
            <TemplatesPivot {...props} />
          </PivotItem>
        </Pivot>
      </div>
      {/*<CreateFunctionCommandBar />*/}
    </>
  );
};
