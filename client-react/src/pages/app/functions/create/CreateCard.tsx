import React, { useContext } from 'react';
import { ThemeContext } from '../../../../ThemeContext';
import { getCardStyle, getHeaderStyle, getDescriptionStyle, getSrc } from './FunctionCreate.styles';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { useTranslation } from 'react-i18next';
import { PivotState } from './FunctionCreate';
import { KeyCodes } from 'office-ui-fabric-react';

export interface CreateCardProps {
  functionTemplate: FunctionTemplate;
  setSelectedFunctionTemplate: (FunctionTemplate) => void;
  setPivotStateKey: (PivotState) => void;
}

const CreateCard: React.SFC<CreateCardProps> = props => {
  const { functionTemplate, setSelectedFunctionTemplate, setPivotStateKey } = props;
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  return (
    <>
      <div
        tabIndex={0}
        className={getCardStyle(theme)}
        onClick={() => onTemplateSelected(functionTemplate, setSelectedFunctionTemplate, setPivotStateKey)}
        onKeyDown={event => {
          if (event.keyCode === KeyCodes.enter) {
            onTemplateSelected(functionTemplate, setSelectedFunctionTemplate, setPivotStateKey);
          }
        }}>
        <div className={getHeaderStyle(functionTemplate)}>
          <img src={getSrc(functionTemplate)} />
          {functionTemplate.metadata.name}
        </div>

        <div className={getDescriptionStyle(theme)}>{t(`${functionTemplate.metadata.description.replace('$', '')}`)}</div>
      </div>
    </>
  );
};

const onTemplateSelected = (
  functionTemplate: FunctionTemplate,
  setSelectedFunctionTemplate: (template: FunctionTemplate) => void,
  setPivotStateKey: (state: PivotState) => void
) => {
  setSelectedFunctionTemplate(functionTemplate);
  setPivotStateKey(PivotState.details);
};

export default CreateCard;
