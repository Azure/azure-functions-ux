import React, { useContext } from 'react';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { ThemeContext } from '../../../../ThemeContext';
import { getCardStyle, getHeaderStyle, getDescriptionStyle } from './FunctionCreate.styles';
import { FunctionTemplate } from '../../../../models/functions/function-template';

export interface CreateCardProps {
  functionTemplate: FunctionTemplate;
}

export interface CreateCardState {
  selected: boolean;
  items: BindingInfo[];
}

const CreateCard: React.SFC<CreateCardProps> = props => {
  const { functionTemplate } = props;

  const theme = useContext(ThemeContext);
  // const { t } = useTranslation();

  return (
    <>
      <div className={getCardStyle(theme)}>
        <div className={getHeaderStyle(theme, functionTemplate)}>
          <img />
          {functionTemplate.metadata.name}
        </div>
        <div className={getDescriptionStyle(theme)}>{functionTemplate.metadata.description}</div>
      </div>
    </>
  );
};

export default CreateCard;
