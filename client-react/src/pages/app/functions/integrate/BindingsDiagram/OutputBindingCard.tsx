import i18next from 'i18next';
import { Link } from 'office-ui-fabric-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as OutputSvg } from '../../../../../images/Common/output.svg';
import { ArmObj } from '../../../../../models/arm-obj';
import { Binding, BindingDirection } from '../../../../../models/functions/binding';
import { BindingInfo } from '../../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import PortalCommunicator from '../../../../../portal-communicator';
import { PortalContext } from '../../../../../PortalContext';
import { ThemeExtended } from '../../../../../theme/SemanticColorsExtended';
import { ThemeContext } from '../../../../../ThemeContext';
import { BindingFormBuilder } from '../../common/BindingFormBuilder';
import { getBindingConfigDirection } from '../BindingPanel/BindingEditor';
import { BindingEditorContext, BindingEditorContextInfo } from '../FunctionIntegrate';
import BindingCard, { BindingCardChildProps, createNew, editExisting, emptyList } from './BindingCard';
import { listStyle } from './BindingDiagram.styles';

const OutputBindingCard: React.SFC<BindingCardChildProps> = props => {
  const { functionInfo, bindings } = props;
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const portalCommunicator = useContext(PortalContext);
  const bindingEditorContext = useContext(BindingEditorContext) as BindingEditorContextInfo;

  const outputs = getOutputBindings(functionInfo.properties.config.bindings);
  const content = getContent(portalCommunicator, functionInfo, bindings, t, bindingEditorContext, theme, outputs);

  return <BindingCard title={t('output')} Svg={OutputSvg} content={content} {...props} />;
};

const getOutputBindings = (bindings: BindingInfo[]): BindingInfo[] => {
  const outputBindings = bindings.filter(b => {
    return getBindingConfigDirection(b) === BindingDirection.out;
  });

  return outputBindings ? outputBindings : [];
};

const getContent = (
  portalCommunicator: PortalCommunicator,
  functionInfo: ArmObj<FunctionInfo>,
  bindings: Binding[],
  t: i18next.TFunction,
  bindingEditorContext: BindingEditorContextInfo,
  theme: ThemeExtended,
  outputBindings: BindingInfo[]
): JSX.Element => {
  const outputList: JSX.Element[] = outputBindings.map((item, i) => {
    const name = item.name ? `(${item.name})` : '';
    const linkName = `${BindingFormBuilder.getBindingTypeName(t, item, bindings)} ${name}`;
    return (
      <li key={i.toString()}>
        <Link onClick={() => editExisting(portalCommunicator, t, functionInfo, item, bindingEditorContext, BindingDirection.out)}>
          {linkName}
        </Link>
      </li>
    );
  });

  const completeOutputList = outputList.length > 0 ? outputList : emptyList(t('integrateNoOutputsDefined'));
  completeOutputList.push(
    <li key={'newOutput'}>
      <Link onClick={() => createNew(portalCommunicator, t, functionInfo, bindingEditorContext, BindingDirection.out)}>
        {t('integrateAddOutput')}
      </Link>
    </li>
  );

  return <ul className={listStyle(theme)}>{completeOutputList}</ul>;
};

export default OutputBindingCard;
