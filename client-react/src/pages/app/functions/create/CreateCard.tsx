import React, { useContext } from 'react';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { ThemeContext } from '../../../../ThemeContext';
import { getCardStyle, getHeaderStyle, getDescriptionStyle, getSrc } from './FunctionCreate.styles';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <>
      <div className={getCardStyle(theme)} onClick={() => onClick(functionTemplate)}>
        <div className={getHeaderStyle(functionTemplate)}>
          <img src={getSrc(functionTemplate)} />
          {functionTemplate.metadata.name}
        </div>

        <div className={getDescriptionStyle(theme)}>{t(`${functionTemplate.metadata.description.replace('$', '')}`)}</div>
      </div>
    </>
  );
};

const onClick = (functionTemplate: FunctionTemplate) => {
  console.log(functionTemplate.id);
};

export default CreateCard;
