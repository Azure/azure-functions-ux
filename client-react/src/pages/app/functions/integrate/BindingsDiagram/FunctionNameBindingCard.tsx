import React, { useContext } from 'react';
import BindingCard, { BindingCardChildProps } from './BindingCard';
import { ReactComponent as FunctionSvg } from '../../../../../images/AppService/functions_f.svg';
import { useTranslation } from 'react-i18next';
import { ArmResourceDescriptor } from '../../../../../utils/resourceDescriptors';
import { Link } from 'office-ui-fabric-react';
import { ThemeExtended } from '../../../../../theme/SemanticColorsExtended';
import { listStyle } from './BindingDiagram.styles';
import { ThemeContext } from '../../../../../ThemeContext';

const FunctionNameBindingCard: React.SFC<BindingCardChildProps> = props => {
  const { functionInfo } = props;
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);

  const descriptor = new ArmResourceDescriptor(functionInfo.id);
  const content = getContent(theme, descriptor.resourceName);

  return <BindingCard title={t('_function')} Svg={FunctionSvg} content={content} {...props} />;
};

const getContent = (theme: ThemeExtended, functionName: string): JSX.Element => {
  return (
    <ul className={listStyle(theme)}>
      <li key={'0'}>
        <Link>{functionName}</Link>
      </li>
    </ul>
  );
};

export default FunctionNameBindingCard;
