import i18next from 'i18next';
import { Link } from 'office-ui-fabric-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as PowerSvg } from '../../../../../../images/Common/power.svg';
import { ArmObj } from '../../../../../../models/arm-obj';
import { Binding, BindingDirection } from '../../../../../../models/functions/binding';
import { BindingInfo } from '../../../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../../../models/functions/function-info';
import PortalCommunicator from '../../../../../../portal-communicator';
import { PortalContext } from '../../../../../../PortalContext';
import { ThemeExtended } from '../../../../../../theme/SemanticColorsExtended';
import { ThemeContext } from '../../../../../../ThemeContext';
import { BindingFormBuilder } from '../../../common/BindingFormBuilder';
import { BindingEditorContext, BindingEditorContextInfo } from '../FunctionIntegrate';
import { getBindingDirection } from '../FunctionIntegrate.utils';
import BindingCard, { createNew, EditableBindingCardProps, editExisting, emptyList } from './BindingCard';
import { listStyle } from './BindingCard.styles';

const TriggerBindingCard: React.SFC<EditableBindingCardProps> = props => {
  const { functionInfo, bindings, readOnly, loadBindingSettings } = props;
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const portalCommunicator = useContext(PortalContext);
  const bindingEditorContext = useContext(BindingEditorContext) as BindingEditorContextInfo;

  const trigger = getTrigger(functionInfo.properties.config.bindings);
  const content = getContent(
    portalCommunicator,
    functionInfo,
    bindings,
    t,
    bindingEditorContext,
    theme,
    trigger,
    readOnly,
    loadBindingSettings
  );

  return <BindingCard title={t('trigger')} Svg={PowerSvg} content={content} {...props} />;
};

const getTrigger = (bindingsInfo: BindingInfo[]): BindingInfo | undefined => {
  return bindingsInfo.find(binding => {
    return getBindingDirection(binding) === BindingDirection.trigger;
  });
};

const getContent = (
  portalCommunicator: PortalCommunicator,
  functionInfo: ArmObj<FunctionInfo>,
  bindings: Binding[],
  t: i18next.TFunction,
  bindingEditorContext: BindingEditorContextInfo,
  theme: ThemeExtended,
  trigger: BindingInfo | undefined,
  readOnly: boolean,
  loadBindingSettings: (bindingId: string, force: boolean) => Promise<void>
): JSX.Element => {
  return (
    <ul className={listStyle(theme)}>
      {trigger ? (
        <li key="0">
          <Link
            onClick={() => {
              loadBindingSettings(bindings.find(binding => binding.type === trigger.type)!.id, false).then(() => {
                editExisting(portalCommunicator, t, functionInfo, trigger, bindingEditorContext, BindingDirection.trigger);
              });
            }}>{`${BindingFormBuilder.getBindingTypeName(trigger, bindings)} (${trigger.name})`}</Link>
        </li>
      ) : !readOnly ? (
        <li key={'newTrigger'}>
          <Link
            onClick={() => {
              const triggerBindings = bindings.filter(binding => binding.direction === BindingDirection.trigger);
              Promise.all(triggerBindings.map(binding => loadBindingSettings(binding.id, false))).then(() => {
                createNew(portalCommunicator, t, functionInfo, bindingEditorContext, BindingDirection.trigger);
              });
            }}>
            {t('integrateAddTrigger')}
          </Link>
        </li>
      ) : (
        emptyList(t('integrateNoTriggerDefined'))
      )}
    </ul>
  );
};

export default TriggerBindingCard;
