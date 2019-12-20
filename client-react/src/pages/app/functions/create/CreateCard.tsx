import React, { useContext } from 'react';
import { ThemeContext } from '../../../../ThemeContext';
import {
  getCardStyle,
  getHeaderStyle,
  getDescriptionStyle,
  getSrc,
  getTitleStyle,
  getInfoStyle,
  getSelectStyle,
} from './FunctionCreate.styles';
import { FunctionTemplate } from '../../../../models/functions/function-template';
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

  return (
    <div
      tabIndex={0}
      className={getCardStyle(theme)}
      onClick={() => onTemplateSelected(functionTemplate, setSelectedFunctionTemplate, setPivotStateKey)}
      onKeyDown={event => {
        if (event.keyCode === KeyCodes.enter) {
          onTemplateSelected(functionTemplate, setSelectedFunctionTemplate, setPivotStateKey);
        }
      }}>
      <div className={getHeaderStyle()}>
        <img src={getSrc(functionTemplate)} />
      </div>

      <div className={getDescriptionStyle()}>
        <div className={getTitleStyle()}>{functionTemplate.name}</div>
        <div className={getInfoStyle()}>{functionTemplate.description}</div>
        <div className={getSelectStyle()}>{'Select >'}</div>
      </div>
    </div>
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
