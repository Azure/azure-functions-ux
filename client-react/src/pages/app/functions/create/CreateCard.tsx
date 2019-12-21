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
import { getBindingDirection } from '../integrate/BindingPanel/BindingEditor';

export interface CreateCardProps {
  functionTemplate: FunctionTemplate;
  setSelectedFunctionTemplate: (FunctionTemplate: FunctionTemplate) => void;
  setPivotStateKey: (PivotState: PivotState) => void;
  setRequiredBindingIds: (Ids: string[]) => void;
}

const CreateCard: React.SFC<CreateCardProps> = props => {
  const { functionTemplate, setSelectedFunctionTemplate, setPivotStateKey, setRequiredBindingIds } = props;
  const theme = useContext(ThemeContext);

  return (
    <div
      tabIndex={0}
      className={getCardStyle(theme)}
      onClick={() => onTemplateSelected(functionTemplate, setSelectedFunctionTemplate, setPivotStateKey, setRequiredBindingIds)}
      onKeyDown={event => {
        if (event.keyCode === KeyCodes.enter) {
          onTemplateSelected(functionTemplate, setSelectedFunctionTemplate, setPivotStateKey, setRequiredBindingIds);
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
  setPivotStateKey: (state: PivotState) => void,
  setRequiredBindingIds: (ids: string[]) => void
) => {
  setSelectedFunctionTemplate(functionTemplate);
  setRequiredBindingIds(getRequiredBindingIds(functionTemplate));
  setPivotStateKey(PivotState.details);
};

const getRequiredBindingIds = (functionTemplate: FunctionTemplate): string[] => {
  const requiredBindingIds: string[] = [];
  if (functionTemplate.userPrompt && functionTemplate.userPrompt.length > 0 && functionTemplate.bindings) {
    functionTemplate.userPrompt.forEach(prompt => {
      if (functionTemplate.bindings) {
        functionTemplate.bindings.forEach(binding => {
          if (binding[prompt]) {
            const bindingDirection = getBindingDirection(binding);
            const bindingId = `${binding.type}-${bindingDirection}`;
            requiredBindingIds.push(bindingId);
          }
        });
      }
    });
  }
  return requiredBindingIds;
};

export default CreateCard;
