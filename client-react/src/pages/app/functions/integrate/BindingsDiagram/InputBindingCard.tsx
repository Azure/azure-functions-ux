import React, { useContext } from 'react';
import BindingCard, { BindingCardChildProps, emptyList, editExisting } from './BindingCard';
import { ReactComponent as InputSvg } from '../../../../../images/Common/input.svg';
import { useTranslation } from 'react-i18next';
import { BindingInfo } from '../../../../../models/functions/function-binding';
import { getBindingConfigDirection } from '../binding-editor/BindingEditor';
import { BindingConfigDirection } from '../../../../../models/functions/bindings-config';
import PortalCommunicator from '../../../../../portal-communicator';
import { ArmObj } from '../../../../../models/arm-obj';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import i18next from 'i18next';
import { BindingEditorContextInfo, BindingEditorContext } from '../FunctionIntegrate';
import { ThemeExtended } from '../../../../../theme/SemanticColorsExtended';
import { listStyle } from './BindingDiagram.styles';
import { Link } from 'office-ui-fabric-react';
import { ThemeContext } from '../../../../../ThemeContext';
import { PortalContext } from '../../../../../PortalContext';

const InputBindingCard: React.SFC<BindingCardChildProps> = props => {
  const { functionInfo } = props;
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const portalCommunicator = useContext(PortalContext);
  const bindingEditorContext = useContext(BindingEditorContext) as BindingEditorContextInfo;

  const inputs = getInputBindings(functionInfo.properties.config.bindings);
  const content = getContent(portalCommunicator, functionInfo, t, bindingEditorContext, theme, inputs);

  return <BindingCard title={t('input')} Svg={InputSvg} content={content} {...props} />;
};

const getInputBindings = (bindings: BindingInfo[]): BindingInfo[] => {
  const inputBindings = bindings.filter(b => {
    return getBindingConfigDirection(b) === BindingConfigDirection.in;
  });

  return inputBindings ? inputBindings : [];
};

const getContent = (
  portalCommunicator: PortalCommunicator,
  functionInfo: ArmObj<FunctionInfo>,
  t: i18next.TFunction,
  bindingEditorContext: BindingEditorContextInfo,
  theme: ThemeExtended,
  inputBindings: BindingInfo[]
): JSX.Element => {
  const inputList = inputBindings.map((item, i) => {
    const name = item.name ? `(${item.name})` : '';
    const linkName = `${item.type} ${name}`;
    return (
      <li key={i.toString()}>
        <Link onClick={() => editExisting(portalCommunicator, t, functionInfo, item, bindingEditorContext)}>{linkName}</Link>
      </li>
    );
  });

  return (
    <ul className={listStyle(theme)}>
      {inputBindings.length > 0 ? inputList : emptyList(t('integrateNoInputsDefined'))}
      <li key={inputBindings.length}>
        <Link>{t('integrateAddInput')}</Link>
      </li>
    </ul>
  );
};

export default InputBindingCard;
