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
import BindingCard, { EditableBindingCardProps, editExisting, createNew } from './BindingCard';
import { listStyle } from './BindingDiagram.styles';
import { BindingFormBuilder } from '../../common/BindingFormBuilder';

const TriggerBindingCard: React.SFC<EditableBindingCardProps> = props => {
  const { functionInfo, bindings, setRequiredBindingId } = props;
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const portalCommunicator = useContext(PortalContext);
  const bindingEditorContext = useContext(BindingEditorContext) as BindingEditorContextInfo;

  const trigger = getTrigger(functionInfo.properties.config.bindings);
  getRequiredBindingData(trigger, bindings, setRequiredBindingId);
  const content = getContent(portalCommunicator, functionInfo, bindings, t, bindingEditorContext, theme, trigger);

  return <BindingCard title={t('trigger')} Svg={PowerSvg} content={content} {...props} />;
};

const getTrigger = (bindingsInfo: BindingInfo[]): BindingInfo | undefined => {
  return bindingsInfo.find(b => {
    return getBindingDirection(b) === BindingDirection.trigger;
  });
};

const getRequiredBindingData = (trigger: BindingInfo | undefined, bindings: Binding[], setRequiredBindingId: (id: string) => void) => {
  if (trigger) {
    const binding = bindings.find(b => b.type === trigger.type && b.direction === BindingDirection.trigger);
    if (binding && !binding.settings) {
      setRequiredBindingId(binding.id);
    }
  }
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
        <li key={'newTrigger'}>
          <Link onClick={() => createNew(portalCommunicator, t, functionInfo, bindingEditorContext, BindingDirection.trigger)}>
            {t('integrateAddTrigger')}
          </Link>
        </li>
      )}
    </ul>
  );
};

export default TriggerBindingCard;
