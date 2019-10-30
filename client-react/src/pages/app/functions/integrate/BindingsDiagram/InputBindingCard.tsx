import i18next from 'i18next';
import { Link } from 'office-ui-fabric-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as InputSvg } from '../../../../../images/Common/input.svg';
import { ArmObj } from '../../../../../models/arm-obj';
import { BindingConfigDirection } from '../../../../../models/functions/bindings-config';
import { BindingInfo } from '../../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import PortalCommunicator from '../../../../../portal-communicator';
import { PortalContext } from '../../../../../PortalContext';
import { ThemeExtended } from '../../../../../theme/SemanticColorsExtended';
import { ThemeContext } from '../../../../../ThemeContext';
import { getBindingConfigDirection } from '../binding-editor/BindingEditor';
import { BindingEditorContext, BindingEditorContextInfo } from '../FunctionIntegrate';
import BindingCard, { BindingCardChildProps, createNew, editExisting, emptyList } from './BindingCard';
import { listStyle } from './BindingDiagram.styles';

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
    const linkName = `${t(item.type)} ${name}`;
    return (
      <li key={i.toString()}>
        <Link onClick={() => editExisting(portalCommunicator, t, functionInfo, item, bindingEditorContext, BindingConfigDirection.in)}>
          {linkName}
        </Link>
      </li>
    );
  });

  const completeInputList = inputList.length > 0 ? inputList : emptyList(t('integrateNoInputsDefined'));
  completeInputList.push(
    <li key={'newInput'}>
      <Link onClick={() => createNew(portalCommunicator, t, functionInfo, bindingEditorContext, BindingConfigDirection.in)}>
        {t('integrateAddInput')}
      </Link>
    </li>
  );

  return <ul className={listStyle(theme)}>{completeInputList}</ul>;
};

export default InputBindingCard;
