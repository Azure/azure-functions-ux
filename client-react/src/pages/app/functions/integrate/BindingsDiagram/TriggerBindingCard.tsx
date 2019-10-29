import React, { useContext } from 'react';
import BindingCard, { BindingCardChildProps, editExisting, emptyList } from './BindingCard';
import { ReactComponent as PowerSvg } from '../../../../../images/Common/power.svg';
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

const TriggerBindingCard: React.SFC<BindingCardChildProps> = props => {
  const { functionInfo } = props;
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const portalCommunicator = useContext(PortalContext);
  const bindingEditorContext = useContext(BindingEditorContext) as BindingEditorContextInfo;

  const trigger = getTrigger(functionInfo.properties.config.bindings);
  const content = getContent(portalCommunicator, functionInfo, t, bindingEditorContext, theme, trigger);

  return <BindingCard title={t('trigger')} Svg={PowerSvg} content={content} {...props} />;
};

const getTrigger = (bindings: BindingInfo[]): BindingInfo | undefined => {
  return bindings.find(b => {
    return getBindingConfigDirection(b) === BindingConfigDirection.trigger;
  });
};

const getContent = (
  portalCommunicator: PortalCommunicator,
  functionInfo: ArmObj<FunctionInfo>,
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
              editExisting(portalCommunicator, t, functionInfo, trigger, bindingEditorContext, BindingConfigDirection.trigger)
            }>{`${trigger.type} ${trigger.name}`}</Link>
        </li>
      ) : (
        emptyList(t('integrateNoTriggerDefined'))
      )}
    </ul>
  );
};

export default TriggerBindingCard;
