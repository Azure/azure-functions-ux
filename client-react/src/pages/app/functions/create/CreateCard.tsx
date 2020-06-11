import { KeyCodes } from 'office-ui-fabric-react';
import React, { useContext } from 'react';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { HostStatus } from '../../../../models/functions/host-status';
import { ThemeContext } from '../../../../ThemeContext';
import { getBindingDirection } from '../function/integrate/FunctionIntegrate.utils';
import { PivotState } from './FunctionCreate';
import { getCardStyle, getDescriptionStyle, getHeaderStyle, getInfoStyle, getSvg, getTitleStyle } from './FunctionCreate.styles';

export interface CreateCardProps {
  functionTemplate: FunctionTemplate;
  setSelectedFunctionTemplate: (FunctionTemplate: FunctionTemplate) => void;
  setPivotStateKey: (PivotState: PivotState) => void;
  setRequiredBindingIds: (Ids: string[]) => void;
  hostStatus: HostStatus;
}

const CreateCard: React.SFC<CreateCardProps> = props => {
  const { functionTemplate, setSelectedFunctionTemplate, setPivotStateKey, setRequiredBindingIds, hostStatus } = props;
  const Svg = getSvg(functionTemplate);
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
        <Svg />
      </div>

      <div className={getDescriptionStyle()}>
        <div className={getTitleStyle()}>{getFunctionTitle(functionTemplate, hostStatus)}</div>
        <div className={getInfoStyle()}>{functionTemplate.description}</div>
      </div>
    </div>
  );
};

const getFunctionTitle = (functionTemplate: FunctionTemplate, hostStatus: HostStatus): string => {
  return hostStatus.version.startsWith('1') ? `${functionTemplate.name}: ${functionTemplate.language}` : functionTemplate.name;
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
  if (functionTemplate.userPrompt && functionTemplate.userPrompt.length > 0) {
    functionTemplate.userPrompt.forEach(prompt => {
      if (functionTemplate.bindings) {
        functionTemplate.bindings.forEach(binding => {
          if (binding[prompt]) {
            const bindingDirection = getBindingDirection(binding);
            const bindingId = `${binding.type}-${bindingDirection}`;
            if (!requiredBindingIds.includes(bindingId)) {
              requiredBindingIds.push(bindingId);
            }
          }
        });
      }
    });
  }
  return requiredBindingIds;
};

export default CreateCard;
