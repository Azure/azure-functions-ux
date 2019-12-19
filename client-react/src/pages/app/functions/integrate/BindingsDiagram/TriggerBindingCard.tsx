import i18next from 'i18next';
import { Link } from 'office-ui-fabric-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as PowerSvg } from '../../../../../images/Common/power.svg';
import { ArmObj } from '../../../../../models/arm-obj';
import { Binding, BindingDirection } from '../../../../../models/functions/binding';
import { BindingInfo } from '../../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import PortalCommunicator from '../../../../../portal-communicator';
import { PortalContext } from '../../../../../PortalContext';
import { ThemeExtended } from '../../../../../theme/SemanticColorsExtended';
import { ThemeContext } from '../../../../../ThemeContext';
import { getBindingDirection } from '../BindingPanel/BindingEditor';
import { BindingEditorContext, BindingEditorContextInfo } from '../FunctionIntegrate';
import BindingCard, { BindingCardChildProps, editExisting, emptyList } from './BindingCard';
import { listStyle } from './BindingDiagram.styles';
import { BindingFormBuilder } from '../../common/BindingFormBuilder';

const TriggerBindingCard: React.SFC<BindingCardChildProps> = props => {
  const { functionInfo, bindings } = props;
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const portalCommunicator = useContext(PortalContext);
  const bindingEditorContext = useContext(BindingEditorContext) as BindingEditorContextInfo;

  const trigger = getTrigger(functionInfo.properties.config.bindings);
  const content = getContent(portalCommunicator, functionInfo, bindings, t, bindingEditorContext, theme, trigger);

  return <BindingCard title={t('trigger')} Svg={PowerSvg} content={content} {...props} />;
};

const getTrigger = (bindings: BindingInfo[]): BindingInfo | undefined => {
  return bindings.find(b => {
    return getBindingDirection(b) === BindingDirection.trigger;
  });
};

const getContent = (
  portalCommunicator: PortalCommunicator,
  functionInfo: ArmObj<FunctionInfo>,
  bindings: Binding[],
  t: i18next.TFunction,
  bindingEditorContext: BindingEditorContextInfo,
  theme: ThemeExtended,
  trigger: BindingInfo | undefined
): JSX.Element => {
  return (
    <ul className={listStyle(theme)}>
      {trigger ? (
        <li key="0">
          <Link
            onClick={() =>
              editExisting(portalCommunicator, t, functionInfo, trigger, bindingEditorContext, BindingDirection.trigger)
            }>{`${BindingFormBuilder.getBindingTypeName(trigger, bindings)} (${trigger.name})`}</Link>
        </li>
      ) : (
        emptyList(t('integrateNoTriggerDefined'))
      )}
    </ul>
  );
};

export default TriggerBindingCard;
