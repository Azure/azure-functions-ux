import React, { useContext } from 'react';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { ThemeContext } from '../../../../ThemeContext';
import { getCardStyle, getHeaderStyle, getDescriptionStyle, getSrc } from './FunctionCreate.styles';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { useTranslation } from 'react-i18next';
import { PivotState } from './FunctionCreate';
import { onTemplateSelected } from './FunctionCreate.data';

export interface CreateCardProps {
  functionTemplate: FunctionTemplate;
  setSelectedFunctionTemplate: (FunctionTemplate) => void;
  setPivotStateKey: (PivotState) => void;
}

export interface CreateCardState {
  selected: boolean;
  items: BindingInfo[];
}

const CreateCard: React.SFC<CreateCardProps> = props => {
  const { functionTemplate, setSelectedFunctionTemplate, setPivotStateKey } = props;
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  return (
    <>
      <div
        className={getCardStyle(theme)}
        onClick={() => onTemplateSelected(functionTemplate, setSelectedFunctionTemplate, setPivotStateKey)}>
        <div className={getHeaderStyle(functionTemplate)}>
          <img src={getSrc(functionTemplate)} />
          {functionTemplate.metadata.name}
        </div>

        <div className={getDescriptionStyle(theme)}>{t(`${functionTemplate.metadata.description.replace('$', '')}`)}</div>
      </div>
    </>
  );
};

export default CreateCard;
